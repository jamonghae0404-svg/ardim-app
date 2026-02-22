import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#2563EB',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Calendar body */}
        <div
          style={{
            background: 'white',
            width: 100,
            height: 100,
            borderRadius: 10,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
          }}
        >
          {/* Calendar header */}
          <div
            style={{
              background: '#1d4ed8',
              height: 26,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 4,
            }}
          >
            <div style={{ background: 'white', width: 5, height: 10, borderRadius: 2 }} />
            <div style={{ background: 'white', width: 5, height: 10, borderRadius: 2 }} />
          </div>
          {/* Check area */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div style={{ position: 'relative', width: 44, height: 36 }}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  bottom: 0,
                  width: 18,
                  height: 6,
                  background: '#2563EB',
                  borderRadius: 3,
                  transform: 'rotate(45deg)',
                  transformOrigin: 'left bottom',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  bottom: 6,
                  width: 36,
                  height: 6,
                  background: '#2563EB',
                  borderRadius: 3,
                  transform: 'rotate(-55deg)',
                  transformOrigin: 'right bottom',
                }}
              />
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 180, height: 180 }
  );
}
