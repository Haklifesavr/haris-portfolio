import { Container, Typography, Grid, Divider } from '@mui/material';
import { useContext, useEffect } from 'react';
import { ColorModeContext } from '../../../../pages/_app';
import MainTitleAnimation from '../../../gsap/MainTitleAnimation';
import { centeredStyles } from '../Perks/Perks';
import ToolCard from './ToolCard';
import gsap from 'gsap';

const TechTools = ({ iconsArray }: any) => {
  const FrontendTools = iconsArray && iconsArray.filter((icon: any) => icon.stack === "frontend");
  const BackendTools = iconsArray && iconsArray.filter((icon: any) => icon.stack === "backend");
  const OtherTools = iconsArray && iconsArray.filter((icon: any) => icon.stack === "other");

  const colorMode = useContext(ColorModeContext);
  // turn off "filter" mode when the theme is set to dark mode
  const isfilterMode = (item: any) => colorMode?.mode === 'light' ? false : item?.filter;

  useEffect(() => {
    MainTitleAnimation('.title1', '.title2');
    gsap.to('.secondTitle', {
      opacity: 1,
      y: 0,
      scrollTrigger: {
        trigger: '.secondTitle',
        start: 'top 70%',
      },
    });
  }, []);

  const noToolsAvailable = (!FrontendTools.length && !BackendTools.length && !OtherTools.length);

  return (
    <>
      <Container
        maxWidth='lg'
        sx={{
          margin: '0 auto',
          py: {
            xs: '6em',
          },
        }}
      >
        <Grid container>
          <Grid item sx={centeredStyles}>
            <Typography
              className='title1 t25o0'
              variant='h1'
              sx={{
                fontSize: {
                  xs: '2.2em',
                  sm: '2.5em',
                  md: '3em',
                },
              }}
              fontWeight='600'
            >
              Tools Driving My Digital Success
            </Typography>
            <Typography
              variant='h2'
              className='secondary title2 t25o0'
              sx={{
                pt: '1.5em',
                maxWidth: '570px',
                fontSize: {
                  xs: '.8em',
                  sm: '1em',
                },
              }}
            >
              Frontend technologies
            </Typography>
          </Grid>
          <Grid
            sx={{
              ...centeredStyles,
              flexDirection: 'row',
              justifyContent: {
                xs: "center",
              },
              mt: '3em',
              flexWrap: 'wrap',
            }}
            xs={12}
            item
          >
            {FrontendTools && FrontendTools.map((item: any) => (
              <ToolCard
                className='toolCard1'
                filter={isfilterMode(item)}
                svg={item.svg}
                title={item.title}
                key={item.title}
              />
            ))}
          </Grid>

          {BackendTools && BackendTools.length > 0 && (
            <>
              <Grid item sx={centeredStyles}>
                <Typography
                  variant='h2'
                  className='secondary secondTitle t25o0'
                  sx={{
                    pt: '3.5em',
                    opacity: 0,
                    fontSize: {
                      xs: '.8em',
                      sm: '1em',
                    },
                  }}
                >
                  Backend technologies
                </Typography>
              </Grid>
              <Grid
                sx={{
                  ...centeredStyles,
                  flexDirection: 'row',
                  justifyContent: {
                    xs: "center",
                  },
                  mt: '3em',
                  flexWrap: 'wrap',
                }}
                xs={12}
                item
              >
                {BackendTools.map((tool: any) => (
                  <ToolCard
                    className='toolCard2'
                    filter={isfilterMode(tool)}
                    svg={tool.svg}
                    title={tool.title}
                    key={tool.title}
                  />
                ))}
              </Grid>
            </>
          )}

          {OtherTools && OtherTools.length > 0 && (
            <>
              <Grid item sx={centeredStyles}>
                <Typography
                  variant='h2'
                  className='secondary secondTitle t25o0'
                  sx={{
                    pt: '3.5em',
                    opacity: 0,
                    fontSize: {
                      xs: '.8em',
                      sm: '1em',
                    },
                  }}
                >
                  Other technologies
                </Typography>
              </Grid>
              <Grid
                sx={{
                  ...centeredStyles,
                  flexDirection: 'row',
                  justifyContent: {
                    xs: "center",
                  },
                  mt: '3em',
                  flexWrap: 'wrap',
                }}
                xs={12}
                item
              >
                {OtherTools.map((tool: any) => (
                  <ToolCard
                    className='toolCard3'
                    filter={isfilterMode(tool)}
                    svg={tool.svg}
                    title={tool.title}
                    key={tool.title}
                  />
                ))}
              </Grid>
            </>
          )}

          {noToolsAvailable && (
            <Typography
              sx={{
                margin: '0 auto',
                fontSize: '1em',
                fontWeight: '500',
                color: 'red',
              }}
              variant='h1'
            >
              There was an error loading the items.
            </Typography>
          )}
        </Grid>
      </Container>
      <Divider />
    </>
  );
};

export default TechTools;
