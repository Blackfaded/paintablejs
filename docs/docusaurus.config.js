module.exports = {
  title: 'Paintable.js',
  tagline: 'Make your canvas drawable and much more',
  url: 'reverent-neumann-b3ceb6.netlify.app/',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'Blackfaded',
  projectName: 'paintablejs',
  themeConfig: {
    navbar: {
      title: 'Paintable.js',
      logo: {
        alt: 'Paintable.js Logo',
        src: 'img/drawing.png',
      },
      items: [
        {
          to: 'https://github.com/Blackfaded/paintablejs',
          label: 'Github',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Community',
          items: [
            {
              label: 'Stack Overflow',
              href: 'https://stackoverflow.com/questions/tagged/paintablejs',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} René Heinen.`,
    },
  },
  presets: [
    [
      '@docusaurus/preset-classic',
      {
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          routeBasePath: '/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      },
    ],
  ],
};
