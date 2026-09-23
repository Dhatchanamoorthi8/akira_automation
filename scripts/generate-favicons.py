import base64
import io
from PIL import Image, ImageFilter
import numpy as np

def generate():
    # 1. Load the isolated A image
    im_isolated = Image.open('public/assets/company/test_isolated_A.png').convert('RGBA')
    arr = np.array(im_isolated)

    # 2. Extract alpha channel with anti-aliasing
    rgb = arr[:, :, :3]
    diff = 255.0 - np.mean(rgb, axis=2)
    alpha = np.clip((diff - 4.0) * (255.0 / 22.0), 0, 255).astype(np.uint8)
    arr[:, :, 3] = alpha

    im_trans = Image.fromarray(arr)
    bbox = im_trans.getbbox()
    im_cropped = im_trans.crop(bbox)
    cw, ch = im_cropped.size
    print(f'Cropped emblem size: {cw}x{ch}')

    # 3. Fit emblem onto a 512x512 canvas
    # Target max dimension = 440px to leave comfortable 36px breathing room
    scale = min(440.0 / cw, 440.0 / ch)
    nw, nh = int(cw * scale), int(ch * scale)
    im_scaled = im_cropped.resize((nw, nh), Image.Resampling.LANCZOS)

    # Create 512x512 transparent canvas
    canvas_512 = Image.new('RGBA', (512, 512), (0, 0, 0, 0))
    ox = (512 - nw) // 2
    oy = (512 - nh) // 2
    canvas_512.paste(im_scaled, (ox, oy), im_scaled)

    # 4. Generate the white hairline halo for high contrast on dark browser tabs
    alpha_512 = np.array(canvas_512)[:, :, 3]
    alpha_pil = Image.fromarray(alpha_512)
    dilated = alpha_pil.filter(ImageFilter.MaxFilter(9))
    halo_mask = Image.fromarray(np.clip(np.array(dilated).astype(int) - np.array(alpha_pil).astype(int), 0, 255).astype(np.uint8))

    halo_arr = np.zeros((512, 512, 4), dtype=np.uint8)
    halo_arr[:, :, 0] = 255
    halo_arr[:, :, 1] = 255
    halo_arr[:, :, 2] = 255
    halo_arr[:, :, 3] = (np.array(halo_mask) * 0.85).astype(np.uint8)
    halo_img = Image.fromarray(halo_arr)

    # Master transparent icon with halo
    master_trans = Image.alpha_composite(halo_img, canvas_512)

    # 5. Save favicon-96x96.png
    fav_96 = master_trans.resize((96, 96), Image.Resampling.LANCZOS)
    fav_96.save('public/favicon-96x96.png', format='PNG')
    print('Saved public/favicon-96x96.png')

    # 6. Save multi-resolution favicon.ico (16, 32, 48)
    master_trans.save('public/favicon.ico', format='ICO', sizes=[(16, 16), (32, 32), (48, 48)])
    print('Saved public/favicon.ico')

    # 7. Create solid white background version for Apple Touch Icon & PWA Manifest
    # Safe zone for maskable icon is center 80%
    scale_maskable = min(370.0 / cw, 370.0 / ch)
    mw, mh = int(cw * scale_maskable), int(ch * scale_maskable)
    emblem_maskable = im_cropped.resize((mw, mh), Image.Resampling.LANCZOS)

    master_white_512 = Image.new('RGBA', (512, 512), (255, 255, 255, 255))
    mox = (512 - mw) // 2
    moy = (512 - mh) // 2
    master_white_512.paste(emblem_maskable, (mox, moy), emblem_maskable)

    # Save web-app-manifest-512x512.png
    master_white_512.save('public/web-app-manifest-512x512.png', format='PNG')
    print('Saved public/web-app-manifest-512x512.png')

    # Save web-app-manifest-192x192.png
    pwa_192 = master_white_512.resize((192, 192), Image.Resampling.LANCZOS)
    pwa_192.save('public/web-app-manifest-192x192.png', format='PNG')
    print('Saved public/web-app-manifest-192x192.png')

    # Save apple-touch-icon.png (180x180)
    apple_180 = master_white_512.resize((180, 180), Image.Resampling.LANCZOS)
    apple_180.save('public/apple-touch-icon.png', format='PNG')
    print('Saved public/apple-touch-icon.png')

    # 8. Generate public/favicon.svg
    buf = io.BytesIO()
    master_trans.save(buf, format='PNG')
    b64_png = base64.b64encode(buf.getvalue()).decode('utf-8')

    svg_content = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <title>Akira Precision Automation</title>
  <image width="512" height="512" href="data:image/png;base64,{b64_png}" />
</svg>
'''
    with open('public/favicon.svg', 'w', encoding='utf-8') as f:
        f.write(svg_content)
    print('Saved public/favicon.svg')

if __name__ == '__main__':
    generate()
