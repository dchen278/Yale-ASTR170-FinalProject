import pandas as pd
import os
import requests
from io import BytesIO
from PIL import Image
import time
import hashlib

def query_object_info(objid):
    url = f"http://cas.sdss.org/dr7/en/tools/search/x_sql.asp"
    query = f"SELECT ra, dec FROM PhotoObj WHERE objID = {objid}"
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
            return ra, dec
    print(f"Failed to retrieve RA and Dec for objid: {objid}")
    return None, None

def download_image(objid, ra, dec, save_dir):
    base_url = "http://skyservice.pha.jhu.edu/DR7/ImgCutout/getjpeg.aspx"
    params = {
        'ra': ra,
        'dec': dec,
        'scale': 0.396,
        'width': 128,
        'height': 128,
        'opt': 'G'
    }
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        img = Image.open(BytesIO(response.content))
        image_name = f"{objid}.jpg"
        img.save(os.path.join(save_dir, image_name))
        return image_name
    else:
        print(f"Failed to download image for objid: {objid}")
        return None

def create_image_label_csv(data_csv, images_dir, output_csv):
    df = pd.read_csv(data_csv)
    image_names = []
    labels = []
    if not os.path.exists(images_dir):
        os.makedirs(images_dir)
    for index, row in df.iterrows():
        objid = row['dr7objid']
        label = row['ML2classes']
        image_name = f"{objid}.jpg"
        image_path = os.path.join(images_dir, image_name)
        if not os.path.exists(image_path):
            ra, dec = query_object_info(objid)
            if ra is None or dec is None:
                continue
            downloaded_image_name = download_image(objid, ra, dec, images_dir)
            if downloaded_image_name is None:
                continue
        image_names.append(image_name)
        labels.append(label)
        # time.sleep(0.1)
    new_df = pd.DataFrame({'image_name': image_names, 'label': labels})
    new_df.to_csv(output_csv, index=False)

if __name__ == "__main__":
    data_csv = 'Barchi19_Morph-catalog_670k-galaxies.csv'
    images_dir = 'images'
    output_csv = 'data.csv'
    create_image_label_csv(data_csv, images_dir, output_csv)
