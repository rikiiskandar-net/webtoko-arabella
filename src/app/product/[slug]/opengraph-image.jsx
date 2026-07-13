import { ImageResponse } from 'next/og';
import prisma from "@/lib/prisma";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

const isUUID = (str) => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

export default async function Image({ params }) {
  const { slug } = await params;
  let product = await prisma.product.findUnique({ where: { slug } });
  
  if (!product && isUUID(slug)) {
    product = await prisma.product.findUnique({ where: { id: slug } });
  }

  if (!product) {
    return new ImageResponse(
      (
        <div style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#FFF7ED',
          fontSize: 48,
          fontWeight: 800,
          color: '#0F172A',
        }}>
          Produk Tidak Ditemukan
        </div>
      ),
      { ...size }
    );
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.arabella.web.id';
  const imgUrl = product.image.startsWith('http') ? product.image : `${baseUrl}${product.image}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'row',
          backgroundColor: '#fff',
          fontFamily: 'sans-serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            padding: '60px',
            width: '60%',
            height: '100%',
            backgroundColor: '#FFF7ED',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <span style={{ fontSize: '32px', fontWeight: 'bold', color: '#D97706' }}>
              Dapur Arabella
            </span>
          </div>
          <h1
            style={{
              fontSize: '64px',
              fontWeight: 900,
              color: '#0F172A',
              lineHeight: 1.1,
              marginBottom: '20px',
            }}
          >
            {product.name}
          </h1>
          <div
            style={{
              fontSize: '48px',
              fontWeight: 700,
              color: '#EA580C',
              marginBottom: '30px',
            }}
          >
            Rp {product.price.toLocaleString('id-ID')}
          </div>
          
          <div style={{ display: 'flex', gap: '15px' }}>
            <div
              style={{
                display: 'flex',
                backgroundColor: '#FEF3C7',
                padding: '10px 20px',
                borderRadius: '50px',
                fontSize: '24px',
                fontWeight: 600,
                color: '#D97706',
              }}
            >
              Rating {product.rating}/5
            </div>
            <div
              style={{
                display: 'flex',
                backgroundColor: '#E0E7FF',
                padding: '10px 20px',
                borderRadius: '50px',
                fontSize: '24px',
                fontWeight: 600,
                color: '#4338CA',
              }}
            >
              Terjual {product.sold}+
            </div>
          </div>
        </div>

        <div
          style={{
            display: 'flex',
            width: '40%',
            height: '100%',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#FFEDD5',
            overflow: 'hidden',
          }}
        >
          <img
            src={imgUrl}
            alt={product.name}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
