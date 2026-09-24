import gsap from 'gsap';
import {Box, Typography, Divider, Grid} from '@mui/material';

import Link from 'next/link';
import { useRouter } from 'next/router';
function Copyright() {
    return (
<>
        <Divider/>
        <Box
        maxWidth='lg' 
        sx={{
            textAlign:'center',
            margin : '1em auto'
        }}>
            <Typography variant="body2" color="textSecondary" component="p">
                &copy; {new Date().getFullYear()} Haris Khan. All rights reserved.
            </Typography>
        </Box>
        </>

    );
}
const styles = {
    mt: '1em',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    flexWrap: 'wrap',
    color: 'white'
}

// This footer is always dark, regardless of the site's light/dark mode, so
// explicit white/light colors here (unlike ProjectCard) are intentional.
// The bug was that Home/Contact weren't picking those up at all — a plain
// anchor falls back to the browser's default link blue unless something
// overrides it, and that's what was happening here.
const footerLinkStyles = {
    color: 'white',
    textDecoration: 'none',
    cursor: 'pointer',
    width: 'fit-content',
    ':hover': {
        color: '#66b2ff'
    }
}

function Footer() {
    const router = useRouter()
    return (
        <Box >
            <Divider/>
            <Box
                sx={{
                width: '100%',
                color: 'white',
                minHeight: '200px',
                display: 'flex',
                margin: '0 auto'
            }}>
                <Grid
                    sx={{
                    gap: '1.5em',
                    mx: {
                        xs: '3vw',
                        lg: 'auto'
                    },
                    my: '2em'
                }}
                    maxWidth='lg'
                    container>
                    <Grid item xs={12} sm={6} md={5}>
                        <Typography variant='h1' fontSize='1.4em' fontWeight='400'>About Me</Typography>

                        <Box sx={styles}>
                            <Typography variant='h3' fontSize='1em'>
                            I am committed to delivering innovative and efficient solutions to solve complex business challenges.
                            </Typography>
                        </Box>

                    </Grid>
                    <Grid item xs={12} sm={4} md={3}>
                        <Typography variant='h1' fontSize='1.4em' fontWeight='400'>Links</Typography>

                        <Box className='link' sx={styles}>
                            <Typography
                            component="span"
                            sx={footerLinkStyles}
                            onClick={()=>{router.push('/'); gsap.to(window, {duration: .8, scrollTo: `#hero`})}}
                            >Home</Typography>
                            <Link href='/contact' style={footerLinkStyles}>Contact</Link>
                        </Box>

                    </Grid>
                    <Grid item xs={12} sm={3} md={3}>
                        <Typography variant='h1' fontSize='1.4em' fontWeight='400'>Contact</Typography>
                        <Box className='link' sx={styles}>
                            <Typography variant='h1' fontSize='1em'>hak173129@gmail.com</Typography>
                            <Typography variant='h1' fontSize='1em'>Lahore/Pakistan</Typography>
                            <Typography variant='h1' fontSize='1em'>+92 3340413873</Typography>
                        </Box>
                    </Grid>
                </Grid>
            </Box>
            <Copyright/>
        </Box>

    );

}
export default Footer
