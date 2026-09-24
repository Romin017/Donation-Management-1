import { createSystem, defaultConfig, defineConfig } from '@chakra-ui/react'

const customConfig = defineConfig({
  theme: {
    tokens: {
      colors: {
        brand: {
          50: { value: '#e6f7f2' },
          100: { value: '#bfeadb' },
          200: { value: '#80d5b7' },
          500: { value: '#105646' },
          600: { value: '#0c4236' },
          700: { value: '#09332a' },
        },
      },
    },
  },
})

const theme = createSystem(defaultConfig, customConfig)

export default theme

