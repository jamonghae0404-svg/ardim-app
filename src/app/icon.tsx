import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#2563EB',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 90,
          gap: 16,
        }}
      >
        {/* Calendar body */}
        <div
          style={{
            background: 'white',
            width: 280,
            height: 280,
            borderRadius: 28,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Calendar header */}
          <div
            style={{
              background: '#1d4ed8',
              height: 72,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            <div style={{ background: 'white', width: 12, height: 28, borderRadius: 4 }} />
            <div style={{ background: 'white', width: 12, height: 28, borderRadius: 4 }} />
          </div>
          {/* Checkmark area */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {/* Checkmark using two rectangles */}
            <div style={{ position: 'relative', width: 120, height: 100 }}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  bottom: 0,
                  width: 48,
                  height: 16,
                  background: '#2563EB',
                  borderRadius: 8,
                  transform: 'rotate(45deg)',
                  transformOrigin: 'left bottom',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  bottom: 16,
                  width: 96,
                  height: 16,
                  background: '#2563EB',
                  borderRadius: 8,
                  transform: 'rotate(-55deg)',
                  transformOrigin: 'right bottom',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
