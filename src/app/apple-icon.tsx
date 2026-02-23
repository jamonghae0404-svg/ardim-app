import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(150deg, #1e3a8a 0%, #1d4ed8 52%, #3b82f6 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {/* Calendar card */}
        <div
          style={{
            background: 'white',
            width: 110,
            height: 115,
            borderRadius: 11,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 8px 24px rgba(0,0,0,0.30)',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(160deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%)',
              height: 32,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: 16,
            }}
          >
            {/* Left ring */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: 5,
                  height: 4,
                  background: 'rgba(255,255,255,0.35)',
                  borderRadius: '2px 2px 0 0',
                }}
              />
              <div
                style={{
                  width: 5,
                  height: 10,
                  background: 'white',
                  borderRadius: '0 0 2px 2px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }}
              />
            </div>
            {/* Right ring */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: 5,
                  height: 4,
                  background: 'rgba(255,255,255,0.35)',
                  borderRadius: '2px 2px 0 0',
                }}
              />
              <div
                style={{
                  width: 5,
                  height: 10,
                  background: 'white',
                  borderRadius: '0 0 2px 2px',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
                }}
              />
            </div>
          </div>

          {/* Body */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 5,
              padding: '5px 6px 8px',
            }}
          >
            {/* Day indicator row — 4 squares */}
            <div style={{ display: 'flex', gap: 3 }}>
              <div style={{ width: 16, height: 12, borderRadius: 3, background: '#f3f4f6' }} />
              <div style={{ width: 16, height: 12, borderRadius: 3, background: '#dbeafe' }} />
              <div style={{ width: 16, height: 12, borderRadius: 3, background: '#f3f4f6' }} />
              <div style={{ width: 16, height: 12, borderRadius: 3, background: '#f3f4f6' }} />
            </div>

            {/* Emerald checkmark badge */}
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 21,
                background: 'linear-gradient(135deg, #047857 0%, #059669 40%, #10b981 100%)',
                boxShadow: '0 4px 14px rgba(5,150,105,0.42)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Checkmark */}
              <div style={{ position: 'relative', width: 24, height: 20 }}>
                {/* Short left arm */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    width: 10,
                    height: 5,
                    background: 'white',
                    borderRadius: 3,
                    transform: 'rotate(45deg)',
                    transformOrigin: 'left bottom',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                  }}
                />
                {/* Long right arm */}
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    bottom: 7,
                    width: 20,
                    height: 5,
                    background: 'white',
                    borderRadius: 3,
                    transform: 'rotate(-55deg)',
                    transformOrigin: 'right bottom',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 180, height: 180 }
  );
}
