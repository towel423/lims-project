'use client'

// React Imports
import { useState, useEffect } from 'react'

// MUI Imports
import Badge from '@mui/material/Badge'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Typography from '@mui/material/Typography'
import { useTheme } from '@mui/material/styles'

// Third-party Components
import classnames from 'classnames'
import { useKeenSlider } from 'keen-slider/react'
import type { KeenSliderPlugin } from 'keen-slider/react'

// Components Imports
import AppKeenSlider from '@/libs/styles/AppKeenSlider'
import { useBannerTable } from "@/hooks/data/useBannerData"

type DataType = {
  img: string
  title: string
  subtitle: string
  link: string
  details: { [key: string]: string }
}

const Slides = () => {
  const { data } = useBannerTable();
  const transformedData: DataType[] = Array.isArray(data?.data)
  ? data.data
      .filter((item: any) => item.active == 1) // Filter items where active is true
      .map((item: any) => ({
        img: item.image_url,
        title: item.title,
        subtitle: item.subtitle,
        link: item.link,
        details: item.details || { subtitle: item.subtitle, link: item.link },
      }))
  : [];

  return (
    <>
      {transformedData.map((slide: DataType, index: number) => (
        <div
          key={index}
          className={classnames('keen-slider__slide p-6 pbe-12 is-full')}
          style={{
            backgroundImage: `url(${slide.img})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        >
          <Grid container spacing={4} className='relative'>
            <Grid item xs={12} sm={8} className='order-2 sm:order-1'>
              <div className='flex flex-col gap-4 pbs-5 sm:plb-6'>
                <Typography className='font-medium text-[var(--mui-palette-common-white)]'>
                  {slide.title}
                </Typography>
                <Typography className='font-medium text-[var(--mui-palette-common-white)]'>
                  {slide.subtitle}
                </Typography>
              </div>
              <button
                onClick={() => (window.location.href = slide.link)}
                className="slide-button bg-blue-500 text-white mt-10 px-4 py-2 rounded"
              >
                Learn More
              </button>
            </Grid>
          </Grid>
        </div>
      ))}
    </>
  );
};

const AutoPlayPlugin: KeenSliderPlugin = (slider) => {
  let timeout: ReturnType<typeof setTimeout>;
  let isMouseOver = false;

  const clearNextTimeout = () => clearTimeout(timeout);

  const nextTimeout = () => {
    clearTimeout(timeout);
    if (!isMouseOver) {
      timeout = setTimeout(() => {
        slider.next();
      }, 3000); // Adjust auto-slide interval here
    }
  };

  slider.on('created', () => {
    slider.container.addEventListener('mouseover', () => {
      isMouseOver = true;
      clearNextTimeout();
    });
    slider.container.addEventListener('mouseout', () => {
      isMouseOver = false;
      nextTimeout();
    });
    nextTimeout();
  });

  slider.on('dragStarted', clearNextTimeout);
  slider.on('animationEnded', nextTimeout);
  slider.on('updated', nextTimeout);
};

const AdminDashboardBanner = () => {
  const [loaded, setLoaded] = useState<boolean>(false);
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  const theme = useTheme();

  const ResizePlugin: KeenSliderPlugin = (slider) => {
    const observer = new ResizeObserver(() => {
      slider.update();
    });
    slider.on('created', () => observer.observe(slider.container));
    slider.on('destroyed', () => observer.unobserve(slider.container));
  };

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      loop: true,
      rtl: theme.direction === 'rtl',
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel);
      },
      created() {
        setLoaded(true);
      },
    },
    [ResizePlugin, AutoPlayPlugin]
  );

  return (
    <AppKeenSlider>
      <Card className='bg-primary'>
        <div ref={sliderRef} className='keen-slider relative'>
          {loaded && instanceRef.current && (
            <div className='swiper-dots absolute top-1 inline-end-6'>
              {[...(Array(instanceRef.current?.track?.details?.slides?.length || 0).keys())].map((idx) => (
                <Badge
                  key={idx}
                  variant='dot'
                  component='div'
                  className={classnames({ active: currentSlide === idx })}
                  onClick={() => instanceRef.current?.moveToIdx(idx)}
                  sx={{
                    '& .MuiBadge-dot': {
                      width: '8px !important',
                      height: '8px !important',
                      backgroundColor: 'var(--mui-palette-common-white) !important',
                      opacity: 0.4,
                    },
                    '&.active .MuiBadge-dot': {
                      opacity: 1,
                    },
                  }}
                />
              ))}
            </div>
          )}
          <Slides />
        </div>
      </Card>
    </AppKeenSlider>
  );
};

export default AdminDashboardBanner;
