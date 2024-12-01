import { NextRequest, NextResponse } from 'next/server';
import { Buffer } from 'buffer';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Convert the file to base64 for sending to Flask API
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    // const base64Image = buffer.toString('base64');

    // Send to Flask backend
    formData.append('image', image);

    const response = await fetch('http://127.0.0.1:5000/classify', {
      method: 'POST',
      body: formData,
    });


    const data = await response.json();
    console.log(data)

    const explanations: Record<string, string> = {
      'Class 0': 'These galaxies are disk-shaped and viewed face-on, with no visible spiral structure. They likely originated from gas clouds that collapsed into a rotating disk but lacked the density or instability needed to form spiral arms.',
      'Class 1': 'Smooth, completely round galaxies are usually elliptical galaxies formed through the collision and merger of smaller galaxies. This process destroys most of the original structures, leaving a uniform appearance.',
      'Class 2': 'Smooth galaxies with an intermediate shape between completely round and elliptical. These may represent transitional phases in galaxy evolution or galaxies influenced by weaker gravitational interactions.',
      'Class 3': 'Smooth, cigar-shaped galaxies are typically elongated elliptical galaxies. Their shape may result from rotation or the tidal forces of nearby galaxies during close encounters.',
      'Class 4': 'Disk-shaped galaxies viewed edge-on, with a rounded central bulge. These galaxies likely formed from rotating gas clouds where the bulge developed early due to rapid star formation at the center.',
      'Class 5': 'Disk-shaped galaxies viewed edge-on, featuring a boxy or rectangular bulge. This morphology may arise from the gravitational influence of a central bar or the accretion of smaller companion galaxies.',
      'Class 6': 'Disk-shaped galaxies viewed edge-on, with no noticeable central bulge. These galaxies are often younger or less evolved, with star formation more evenly distributed across the disk.',
      'Class 7': 'Disk-shaped galaxies viewed face-on, with tightly wound spiral arms. The tight spirals suggest a high density of stars and gas, with strong central gravitational forces shaping the arms.',
      'Class 8': 'Disk-shaped galaxies viewed face-on, with moderately wound spiral arms. These galaxies often have an intermediate level of star formation and gravitational cohesion compared to tighter spirals.',
      'Class 9': 'Disk-shaped galaxies viewed face-on, with loosely wound spiral arms. These galaxies are often less dense, with lower star formation rates and weaker gravitational forces shaping the arms.',
    };
        
    return NextResponse.json({
      classification: data.classification,
      confidence: data.confidence,
      explanation: explanations[data.class] || 'A fascinating galaxy type!',
    });
  } catch (error) {
    console.error('Error classifying image:', error);
    return NextResponse.json(
      { error: 'Failed to classify image' },
      { status: 500 }
    );
  }
}