import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

export default function Icon() {
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
          borderRadius: 96,
        }}
      >
        {/* Calendar card */}
        <div
          style={{
            background: 'white',
            width: 312,
            height: 324,
            borderRadius: 28,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 24px 64px rgba(0,0,0,0.32)',
          }}
        >
          {/* Header */}
          <div
            style={{
              background: 'linear-gradient(160deg, #1e40af 0%, #2563eb 60%, #3b82f6 100%)',
              height: 90,
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              gap: 42,
            }}
          >
            {/* Left ring */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: 14,
                  height: 10,
                  background: 'rgba(255,255,255,0.35)',
                  borderRadius: '5px 5px 0 0',
                }}
              />
              <div
                style={{
                  width: 14,
                  height: 30,
                  background: 'white',
                  borderRadius: '0 0 5px 5px',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.18)',
                }}
              />
            </div>
            {/* Right ring */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div
                style={{
                  width: 14,
                  height: 10,
                  background: 'rgba(255,255,255,0.35)',
                  borderRadius: '5px 5px 0 0',
                }}
              />
              <div
                style={{
                  width: 14,
                  height: 30,
                  background: 'white',
                  borderRadius: '0 0 5px 5px',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.18)',
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
              gap: 14,
              padding: '16px 20px 22px',
            }}
          >
            {/* Day indicator row — 7 squares */}
            <div style={{ display: 'flex', gap: 6 }}>
              <div style={{ width: 28, height: 22, borderRadius: 7, background: '#f3f4f6' }} />
              <div style={{ width: 28, height: 22, borderRadius: 7, background: '#f3f4f6' }} />
              <div style={{ width: 28, height: 22, borderRadius: 7, background: '#dbeafe' }} />
              <div style={{ width: 28, height: 22, borderRadius: 7, background: '#f3f4f6' }} />
              <div style={{ width: 28, height: 22, borderRadius: 7, background: '#f3f4f6' }} />
              <div style={{ width: 28, height: 22, borderRadius: 7, background: '#f3f4f6' }} />
              <div style={{ width: 28, height: 22, borderRadius: 7, background: '#f3f4f6' }} />
            </div>

            {/* Emerald checkmark badge */}
            <div
              style={{
                width: 116,
                height: 116,
                borderRadius: 58,
                background: 'linear-gradient(135deg, #047857 0%, #059669 40%, #10b981 100%)',
                boxShadow: '0 12px 36px rgba(5,150,105,0.45)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {/* Checkmark — two-rectangle approach */}
              <div style={{ position: 'relative', display: 'flex', width: 64, height: 52 }}>
                {/* Short left arm */}
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    bottom: 0,
                    width: 28,
                    height: 14,
                    background: 'white',
                    borderRadius: 7,
                    transform: 'rotate(45deg)',
                    transformOrigin: 'left bottom',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.14)',
                  }}
                />
                {/* Long right arm */}
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    bottom: 20,
                    width: 54,
                    height: 14,
                    background: 'white',
                    borderRadius: 7,
                    transform: 'rotate(-55deg)',
                    transformOrigin: 'right bottom',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.14)',
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    { width: 512, height: 512 }
  );
}
