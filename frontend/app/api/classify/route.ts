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
    const base64Image = buffer.toString('base64');

    // Send to Flask backend
    const response = await fetch('http://localhost:5000/classify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image: base64Image,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to classify image');
    }

    const data = await response.json();

    // Add explanations for each galaxy type
    const explanations: Record<string, string> = {
      'elliptical': 'Elliptical galaxies are smooth, featureless systems of stars that appear as ellipses in the sky. They contain mostly older stars and little gas or dust.',
      'spiral': 'Spiral galaxies have a central bulge surrounded by a disk of stars, gas and dust in a spiral structure. They are often sites of active star formation.',
      'barred spiral': 'Barred spiral galaxies are spiral galaxies with a bar-shaped structure of stars through their center. The spiral arms often start at the ends of the bar.',
      'lenticular': 'Lenticular galaxies are intermediate between elliptical and spiral galaxies. They have a disk and bulge like spiral galaxies but lack spiral arms.',
    };

    return NextResponse.json({
      classification: data.classification,
      confidence: data.confidence,
      explanation: explanations[data.classification.toLowerCase()] || 'A fascinating galaxy type!',
    });
  } catch (error) {
    console.error('Error classifying image:', error);
    return NextResponse.json(
      { error: 'Failed to classify image' },
      { status: 500 }
    );
  }
}