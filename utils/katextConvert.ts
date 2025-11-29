export function simpleKatexToText(latexStr: string) {
  return (
    latexStr

      // 2️⃣ text format
      .replace(/\\text\{([^}]*)\}/g, (_, t) => t)

      // 3️⃣ fractions
      .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, (_, a, b) => `${a}/${b}`)

      // 4️⃣ square root & nth root
      .replace(/\\sqrt\{([^}]*)\}/g, (_, x) => `√(${x})`)
      .replace(/\\sqrt\[([^\]]+)\]\{([^}]*)\}/g, (_, n, x) => `(${x})^(1/${n})`)

      // 5️⃣ superscript & subscript
      .replace(/\^\{([^}]*)\}/g, (_, s) => `^(${s})`)
      .replace(/\^([A-Za-z0-9])/g, (_, s) => `^${s}`)
      .replace(/_\{([^}]*)\}/g, (_, s) => `_${s}`)
      .replace(/_([A-Za-z0-9])/g, (_, s) => `_${s}`)

      // 6️⃣ degree symbol and basic formatting
      .replace(/\\degree/g, "°")
      .replace(/\\\^\\circ/g, "°")
      .replace(/\\circ/g, "°")

      // 7️⃣ Greek letters
      .replace(/\\alpha/g, "α")
      .replace(/\\beta/g, "β")
      .replace(/\\gamma/g, "γ")
      .replace(/\\delta/g, "δ")
      .replace(/\\epsilon/g, "ε")
      .replace(/\\theta/g, "θ")
      .replace(/\\lambda/g, "λ")
      .replace(/\\mu/g, "μ")
      .replace(/\\pi/g, "π")
      .replace(/\\rho/g, "ρ")
      .replace(/\\sigma/g, "σ")
      .replace(/\\phi/g, "φ")
      .replace(/\\omega/g, "ω")
      .replace(/\\Omega/g, "Ω")

      // 8️⃣ Math operators and relations
      .replace(/\\times/g, "×")
      .replace(/\\cdot/g, "·")
      .replace(/\\div/g, "÷")
      .replace(/\\pm/g, "±")
      .replace(/\\leq/g, "≤")
      .replace(/\\geq/g, "≥")
      .replace(/\\neq/g, "≠")
      .replace(/\\approx/g, "≈")
      .replace(/\\infty/g, "∞")

      // 9️⃣ Summations & integrals
      .replace(/\\sum/g, "∑")
      .replace(/\\int/g, "∫")

      // 🔟 Parentheses and brackets
      .replace(/\\left/g, "")
      .replace(/\\right/g, "")

      // 11️⃣ Spaces
      .replace(/~/g, " ")
      .replace(/\\,/g, " ")
      .replace(/\\;/g, " ")
      .replace(/\\!/g, "")
      .replace(/\\quad/g, "  ")
      .replace(/\\qquad/g, "    ")

      // 1️⃣ loại bỏ dấu $...$ (inline math)
      .replace(/\$(.*?)\$/g, (_, m) => m)

      // 12️⃣ Fallback cleanup
      .replace(/\\[a-zA-Z]+/g, "") // remove unknown commands
      .trim()
  );
}
