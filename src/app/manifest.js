export const dynamic = 'force-static';

export default function manifest() {
  return {
    name: 'নবীন মহাজন পাড়া',
    short_name: 'নবীন মহাজন পাড়া',
    description: 'নবীন মহাজন পাড়া ও নবজাগরণ একতা সংঘের অফিশিয়াল ওয়েবসাইট',
    start_url: '/',
    display: 'standalone',
    background_color: '#fef3c7',
    theme_color: '#b91c1c',
    icons: [
      {
        src: '/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}