import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'GitLab CI/CD Components',
  description: 'Comprehensive documentation for GitLab CI/CD components',
  base: '/vibes/gitlab-ci-component/',
  outDir: '../dist',

  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Tutorials', link: '/tutorials/' },
      { text: 'How-to Guides', link: '/how-to/' },
      { text: 'Reference', link: '/reference/' },
      { text: 'Explanation', link: '/explanation/' }
    ],

    sidebar: {
      '/tutorials/': [
        {
          text: 'Tutorials',
          items: [
            { text: 'Introduction', link: '/tutorials/' },
            { text: 'Getting Started', link: '/tutorials/getting-started' },
            { text: 'Your First Component', link: '/tutorials/first-component' },
            { text: 'Building a CI Pipeline', link: '/tutorials/building-pipeline' }
          ]
        }
      ],
      '/how-to/': [
        {
          text: 'How-to Guides',
          items: [
            { text: 'Introduction', link: '/how-to/' },
            { text: 'Create a Component', link: '/how-to/create-component' },
            { text: 'Use Components in Pipelines', link: '/how-to/use-components' },
            { text: 'Share Components', link: '/how-to/share-components' },
            { text: 'Test Components', link: '/how-to/test-components' },
            { text: 'Version Components', link: '/how-to/version-components' }
          ]
        }
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'Introduction', link: '/reference/' },
            { text: 'Component Specification', link: '/reference/component-spec' },
            { text: 'Configuration Options', link: '/reference/configuration' },
            { text: 'Input Parameters', link: '/reference/inputs' },
            { text: 'Output Variables', link: '/reference/outputs' },
            { text: 'CI/CD Keywords', link: '/reference/keywords' }
          ]
        }
      ],
      '/explanation/': [
        {
          text: 'Explanation',
          items: [
            { text: 'Introduction', link: '/explanation/' },
            { text: 'Component Architecture', link: '/explanation/architecture' },
            { text: 'Component Catalog', link: '/explanation/catalog' },
            { text: 'Best Practices', link: '/explanation/best-practices' },
            { text: 'Security Considerations', link: '/explanation/security' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/hawkrives/vibes' }
    ],

    footer: {
      message: 'Documentation structured using the Diátaxis framework',
      copyright: 'Copyright © 2025'
    }
  }
})
