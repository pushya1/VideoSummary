export default function Spinner() {
    return (
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        xmlnsXlink="http://www.w3.org/1999/xlink"
        style={{ animation: 'spin 3s linear infinite' }} // Inline CSS for animation
      >
        <rect width="24" height="24" fill="url(#pattern0_91_8)" />
        <defs>
          <pattern
            id="pattern0_91_8"
            patternContentUnits="objectBoundingBox"
            width="1"
            height="1"
          >
            <use xlinkHref="#image0_91_8" transform="scale(0.0111111)" />
          </pattern>
          <image
            id="image0_91_8"
            width="90"
            height="90"
            preserveAspectRatio="none"
            xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFoAAABaCAYAAAA4qEECAAAACXBIWXMAAAsTAAALEwEAmpwYAAAFBklEQVR4nO2cy2teRRTAf5WaGKHQGvCFBMUKVtJAtP+CL1pBV6KuRCm1qZu20ojWKopLLTbSaIpVsOhGxVUtVtGvPhYuFBc+W0mtoi7sI1IXreGTgVMIl5m5c3Pnu3e+yfnBbMKdmXNO7nfnzJk5BxRFURRFURRFWQpc1LYAuTMETAGnpe2RvymR2Q10C+0FtXJ8/rQY+i81dHy6jqYUGAImgJeBjcBAC4YeBDaJDBM5fuMHgC8LBjoMLG/Q0Gaujwt9vxDjZ8MDDiNtadDQWxz97ycjnnQo+Tcw3IChh2UuW/8nyIjbPIYyvnGvDT3l6X8rmfGpQ9H/gLEeGvom4Lyj72fAMjJjXIxqU/ijHhr6kKPfPLCOTJnxGOzuHhj6Hk+/V8iYyyVOYVP8GHBJREMbl/InR58zwJVkznaP0SYjGvpxT5+tLAEGgB8cBvgHuDqCoa+Qt9b2/M+5bVJ8bPAYbr+jzynLsycdz+73jG/m7isuBu4DnhY/uaqbdNDjDYwF+sIvWZ4bkzFsY5s5q7BM/Gyz4bq3YsggCkMSJ1ioxBHg5gpjrAHOOQyyyzHnNHBW2l5HUOgZx5jnZM5QjC6dwhidkgU7Ops8b+OMfCMXG8zvAjtK3jLfr2fSMaaZK9QzmvH8Kh6mQfZ4voFdceG2B4RCVwInLH1Hasg2YlkIT8hcPoys2zzu54X2Ig3yUIkwF9qPAYvPauBdYFZ2cbdEkG+djHUceAe4vuT5DSJriE4P0vBC+GGgYF3gg4rfx6ZY41mUbe1QGwviconxusKPtsVod8BPuAlWiiyuxbjYjI6PtmHkYqx3yhMh61q+l+Zz0RY3AL8Fynpejr1CY+aNMCrHUyEKvNeinO8HynhYdEoWE4U7WqLEbIvyHS+R7WhAJDEZBsWfnfMsKm3hWsTnROa+jINcJXGH+QUKnYnkwtVx/Rb62fMio5G17xkDnpIdX53NSCxGRBYj09q2hVEURVH6g0tlh1QW2bK1U7JzTPFCYXJ6TS9CkGKbJj2S0svkjPwbQaCzieWfJKdXcgJFIkm9YvzE9pIeyek1JMdXtiP/snZSTqtTXAxz1UtRFEVJkFEJqm9M5HD2MmCz5K9kESa1Bf5/B65rUabVhSzcvg78lx1lvdGibG/mcpQVcjj7VYvyfd3vh7NVrhvsa1HO1/v1ukHVCzTHgGtaPi/8pZ8u0OiVsIYC5kcqxAUOJnrJ8caKlxw7Tcc2fJlVC5u5Cru+ZKxrgQPAt8DbcjeuLmaMt4BvxMsou+KwvsK13UYzug6UCHNaLnWHXET/tdD3j5rfxGFLtZrZiBfRzT+uMXaVpFaY9IQ6qRWbPX3KguwTEVIrXvWkVpjEocZYZckV7Ei+d4xkoR01qoRNRkoWGrcUCvhOdG+UFZI09Cxwe+T0t9EaVcJGI6a/Ge4AnhNdjc59xV2eb+BrEaqE+RI6yxbnbBjwrPBznuCOy3A2NEUZeMxjNF9+YRVD+77VXfEuWMplJAYbKiMxl3sZiX0JFUYxLlyWjHu8AS3101DxqrUB/RfzRpcVr/o8t+JVd3oMZcKQ9NDQyByu/mYPkA3PJ1xg0GxGsuERh5Im7ZcGDI3MZetvdnzZsAL4vqDgJy0Uge1YYhd9t60uYxWwU8KMWxcRQK9raGTObSLDzkTumCRHN4KhlQCqVAlTahBaJUypSWiVMCUSZVXCFEVRFEVRFEUhD/4HcsGzKGrlvlcAAAAASUVORK5CYII="
          />
        </defs>
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </svg>
    );
  }