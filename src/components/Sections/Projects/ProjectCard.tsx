import { Box, Typography, Button, Chip } from '@mui/material';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/dist/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export interface IProjectCard {
  className?: string;
  isReversed: boolean;
  title: string;
  description: string;
  stack: string[];
  liveUrl?: string;
  repoUrl?: string;
  domain?: string; // shown in the browser chrome address bar, e.g. "daivio.com"
  img?: any; // optional real screenshot; falls back to a browser-chrome placeholder when absent
  accent?: string; // hex accent used for the live dot + chip highlight
}

const ProjectCard = ({
  isReversed,
  img,
  className,
  liveUrl,
  repoUrl,
  title,
  description,
  stack,
  domain,
  accent = '#0092ff'
}: IProjectCard) => {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ref.current,
        { opacity: 0, y: 24 },
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: ref.current,
            start: 'top 85%'
          }
        }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <Box
      ref={ref}
      className={className}
      sx={{
        display: 'flex',
        flexDirection: {
          xs: 'column',
          md: isReversed ? 'row' : 'row-reverse'
        },
        alignItems: 'stretch',
        gap: { xs: '1.5em', md: '2.5em' },
        my: { xs: '2.5em', md: '3.5em' }
      }}
    >
      {/* Visual: real screenshot if supplied, otherwise a browser-chrome mock so an
          empty state never looks like a broken/random screenshot.
          This frame is intentionally always dark (like a devtools/terminal
          mock) regardless of site theme — the Content block below is the
          part that follows light/dark mode via theme.palette. */}
      <Box
        sx={{
          flex: { xs: '0 0 auto', md: '0 0 46%' },
          minWidth: 0,
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.28)',
          background: '#14161c'
        }}
      >
        {/* chrome bar */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: '.5em',
            px: '.9em',
            py: '.6em',
            background: '#1b1e26',
            borderBottom: '1px solid rgba(255,255,255,0.06)'
          }}
        >
          <Box sx={{ display: 'flex', gap: '.35em' }}>
            {['#ff5f57', '#febc2e', '#28c840'].map((c) => (
              <Box key={c} sx={{ width: 9, height: 9, borderRadius: '50%', background: c, opacity: 0.85 }} />
            ))}
          </Box>
          {domain && (
            <Box
              sx={{
                ml: '.6em',
                px: '.7em',
                py: '.15em',
                borderRadius: '5px',
                background: 'rgba(255,255,255,0.05)',
                flexGrow: 1,
                minWidth: 0
              }}
            >
              <Typography
                noWrap
                sx={{ fontSize: '.72em', color: 'rgba(255,255,255,0.55)' }}
              >
                {domain}
              </Typography>
            </Box>
          )}
        </Box>

        {/* body */}
        <Box sx={{ position: 'relative', width: '100%', height: { xs: 220, md: 280 } }}>
          {img ? (
            <Image alt={`${title} preview`} src={img} layout="fill" objectFit="cover" />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: `linear-gradient(135deg, ${accent}22 0%, #14161c 70%)`
              }}
            >
              <Typography
                sx={{
                  fontSize: { xs: '2.4em', md: '3em' },
                  fontWeight: 600,
                  color: 'rgba(255,255,255,0.18)',
                  letterSpacing: '.02em'
                }}
              >
                {title
                  .split(' ')
                  .map((w) => w[0])
                  .join('')
                  .slice(0, 3)}
              </Typography>
            </Box>
          )}
        </Box>
      </Box>

      {/* Content */}
      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center'
        }}
      >
        {liveUrl && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: '.5em', mb: '.6em' }}>
            <Box
              sx={{
                width: 7,
                height: 7,
                borderRadius: '50%',
                background: '#28c840',
                boxShadow: '0 0 0 3px rgba(40,200,64,0.18)'
              }}
            />
            <Typography sx={{ fontSize: '.78em', color: 'text.secondary' }}>
              Live in production
            </Typography>
          </Box>
        )}

        <Typography
          sx={{
            fontSize: { xs: '1.5em', md: '1.7em' },
            fontWeight: 600,
            color: 'text.primary',
            mb: '.4em'
          }}
        >
          {title}
        </Typography>

        <Typography
          sx={{
            fontSize: '.95em',
            fontWeight: 300,
            lineHeight: 1.6,
            color: 'text.secondary',
            maxWidth: '52ch'
          }}
        >
          {description}
        </Typography>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '.5em', mt: '1.1em' }}>
          {stack.map((tech) => (
            <Chip
              key={tech}
              label={tech}
              size="small"
              sx={{
                background: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.05)',
                color: 'text.secondary',
                fontSize: '.72em',
                border: (theme) =>
                  `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.1)'}`
              }}
            />
          ))}
        </Box>

        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: '.7em', mt: '1.4em' }}>
          {liveUrl && (
            <a href={liveUrl} rel="noreferrer" target="_blank" style={{ textDecoration: 'none' }}>
              <Button
                variant="contained"
                sx={{
                  background: accent,
                  color: '#fff',
                  padding: '.55em 1.3em',
                  textTransform: 'none',
                  borderRadius: '7px',
                  ':hover': { background: accent, opacity: 0.88 }
                }}
              >
                <Typography fontSize="13px" fontWeight={500}>
                  Visit Site
                </Typography>
              </Button>
            </a>
          )}
          {repoUrl && (
            <a href={repoUrl} rel="noreferrer" target="_blank" style={{ textDecoration: 'none' }}>
              <Button
                variant="outlined"
                sx={{
                  padding: '.55em 1.3em',
                  textTransform: 'none',
                  borderRadius: '7px',
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0.25)',
                  color: 'text.primary',
                  ':hover': {
                    borderColor: 'text.primary',
                    background: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'
                  }
                }}
              >
                <Typography fontSize="13px" fontWeight={500}>
                  View Code
                </Typography>
              </Button>
            </a>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectCard;
