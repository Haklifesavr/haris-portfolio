import { Box, Container, Divider, Grid, Typography } from '@mui/material';
import { centeredStyles } from '../Perks/Perks';
import ProjectCard, { IProjectCard } from './ProjectCard';
import MainTitleAnimation from '../../../gsap/MainTitleAnimation';
import { useEffect } from 'react';

interface IProjects {
  projectsArray: Omit<IProjectCard, 'className' | 'isReversed'>[];
}

const Projects = ({ projectsArray }: IProjects) => {
  useEffect(() => {
    MainTitleAnimation('.title3', '.title4');
  }, []);

  return (
    <Box sx={{ overflowX: 'hidden' }}>
      <Container id="ProjectSection" maxWidth="lg" sx={{ margin: '0 auto', py: '6em' }}>
        <Grid container>
          <Grid item sx={centeredStyles}>
            <Typography
              className="title3 t25o0"
              variant="h1"
              sx={{ fontSize: { xs: '2.2em', sm: '2.5em', md: '3em' } }}
              fontWeight="600"
            >
              Recent Work
            </Typography>
            <Typography
              className="title4 t25o0"
              variant="h2"
              sx={{ pt: '1.5em', maxWidth: '570px', fontSize: { xs: '.8em', sm: '1em' } }}
            >
              A few projects currently in production, with live links so you can try them yourself
            </Typography>
          </Grid>

          <Box sx={{ ...centeredStyles, mt: '3em', width: '100%' }}>
            {projectsArray && projectsArray.length > 0 ? (
              projectsArray.map((project, index) => (
                <ProjectCard
                  key={project.title}
                  isReversed={index % 2 === 0}
                  {...project}
                />
              ))
            ) : (
              <Typography variant="h1" fontSize="1em" fontWeight="500" color="red">
                There was an error loading the projects.
              </Typography>
            )}
          </Box>
        </Grid>
      </Container>
      <Divider className="divider" />
    </Box>
  );
};

export default Projects;
