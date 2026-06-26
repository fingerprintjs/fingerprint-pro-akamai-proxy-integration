import { defineConfig } from 'eslint/config'
import dxTeamConfig from '@fingerprintjs/eslint-config-dx-team'

export default defineConfig([
  {
    extends: [dxTeamConfig],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/consistent-type-assertions': 'off',
      'no-template-curly-in-string': 'off',
      '@typescript-eslint/no-unused-vars': 'warn',
    },
  },
])
