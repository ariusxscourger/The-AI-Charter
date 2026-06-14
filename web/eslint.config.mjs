import nextVitals from "eslint-config-next/core-web-vitals"
import eslintConfigPrettier from "eslint-config-prettier"

const eslintConfig = [
  ...nextVitals,
  eslintConfigPrettier,
  {
    rules: {
      "react/no-unescaped-entities": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
  {
    ignores: [".next/**", "out/**", "build/**", "next-env.d.ts"],
  },
]

export default eslintConfig
