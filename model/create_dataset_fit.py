import pandas as pd
import os
import requests
from io import BytesIO
from PIL import Image
from astropy.io import fits
import matplotlib.pyplot as plt

def query_image_info(objid):
    """
    Query SDSS DR7 to get the RA, Dec, Run, Camcol, and Field for a given objid.
    """
    url = "http://cas.sdss.org/dr7/en/tools/search/x_sql.asp"
    query = f"SELECT ra, dec, run, camcol, field FROM PhotoObj WHERE objID = {objid}"
    params = {
        'cmd': query,
        'format': 'csv'
    }
    response = requests.get(url, params=params)
    if response.status_code == 200:
        df = pd.read_csv(BytesIO(response.content))
        if not df.empty:
            ra = df.iloc[0]['ra']
            dec = df.iloc[0]['dec']
            run = int(df.iloc[0]['run'])
            camcol = int(df.iloc[0]['camcol'])
            field = int(df.iloc[0]['field'])
            return ra, dec, run, camcol, field
    print(f"Failed to retrieve data for objid: {objid}")
    return None, None, None, None, None

def download_fits_image(run, camcol, field, filter_band, save_dir, objid):
    """
    Download the raw FITS image from SDSS DAS based on run, camcol, and field.
    """
    url = f"http://das.sdss.org/imaging/{run}/{camcol}/corr/fpC-{run:06d}-{filter_band}{camcol}-{field:04d}.fit.gz"
    response = requests.get(url, stream=True)
    if response.status_code == 200:
        fits_path = os.path.join(save_dir, f"{objid}.fit.gz")
        with open(fits_path, 'wb') as f:
            f.write(response.content)
        return fits_path
    else:
        print(f"Failed to download FITS image for objid: {objid}")
        return None

def convert_fits_to_jpg(fits_path, save_dir, objid):
    """
    Convert a FITS file to a JPEG without any markings.
    """
    with fits.open(fits_path) as hdul:
        data = hdul[0].data
    # Normalize and plot the image data without any markings
    plt.imshow(data, cmap='gray', origin='lower', vmin=0, vmax=0.01)  # Adjust vmax for better contrast if needed
    plt.axis('off')
    jpg_path = os.path.join(save_dir, f"{objid}.jpg")
    plt.savefig(jpg_path, bbox_inches='tight', pad_inches=0)
    plt.close()
    return jpg_path

def create_image_label_csv(data_csv, images_dir, output_csv):
    """
    Create a CSV file with paths to JPEG images and labels, downloading and converting FITS images as needed.
    """
    df = pd.read_csv(data_csv)
    image_names = []
    labels = []

    if not os.path.exists(images_dir):
        os.makedirs(images_dir)

    for index, row in df.iterrows():
        objid = row['dr7objid']
        label = row['ML2classes']
        
        # Define paths
        image_name = f"{objid}.jpg"
        image_path = os.path.join(images_dir, image_name)

        # Query necessary information and download the FITS image if it doesn't already exist
        if not os.path.exists(image_path):
            ra, dec, run, camcol, field = query_image_info(objid)
            if None in (ra, dec, run, camcol, field):
                continue  # Skip if any data is missing
            fits_path = download_fits_image(run, camcol, field, 'r', images_dir, objid)  # 'r' is the typical filter band
            if fits_path:
                convert_fits_to_jpg(fits_path, images_dir, objid)
                os.remove(fits_path)  # Clean up the FITS file to save space

        image_names.append(image_name)
        labels.append(label)

    # Save the CSV with image names and labels
    new_df = pd.DataFrame({'image_name': image_names, 'label': labels})
    new_df.to_csv(output_csv, index=False)

if __name__ == "__main__":
    data_csv = 'Barchi19_Morph-catalog_670k-galaxies.csv'
    images_dir = 'images'
    output_csv = 'data.csv'
    create_image_label_csv(data_csv, images_dir, output_csv)
