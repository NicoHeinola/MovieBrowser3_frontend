import vuetify from 'eslint-config-vuetify'
import { SemicolonPreference } from "typescript/lib/typescript"

export default vuetify({
  ts: true,
  SemicolonPreference: SemicolonPreference.Insert,
})
