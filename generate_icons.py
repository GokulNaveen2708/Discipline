import os
from PIL import Image, ImageDraw

def create_icons_from_source(source_path):
    try:
        img = Image.open(source_path)
        sizes = [16, 48, 128]
        
        for size in sizes:
            # Resize with high quality
            resized = img.resize((size, size), Image.Resampling.LANCZOS)
            resized.save(f'src/icons/icon{size}.png')
            print(f"Created src/icons/icon{size}.png from source")
            
    except Exception as e:
        print(f"Error processing source image: {e}")
        fallback_creation()

def fallback_creation():
    print("Source image not found or error. Creating placeholders.")
    sizes = [16, 48, 128]
    for size in sizes:
        img = Image.new('RGB', (size, size), color = '#0f0f13')
        d = ImageDraw.Draw(img)
        d.text((size/4, size/4), "D", fill='#ffffff')
        d.rectangle([0, 0, size-1, size-1], outline="white")
        img.save(f'src/icons/icon{size}.png')
        print(f"Created placeholder src/icons/icon{size}.png")

if __name__ == "__main__":
    if not os.path.exists('src/icons'):
        os.makedirs('src/icons')
        
    source_file = 'src/icons/original.png'
    
    if os.path.exists(source_file):
        create_icons_from_source(source_file)
    else:
        fallback_creation()
