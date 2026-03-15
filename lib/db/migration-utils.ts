function isIdentifierChar(char: string): boolean {
  return /[A-Za-z0-9_]/.test(char)
}

function readDollarQuoteTag(sql: string, startIndex: number): string | null {
  if (sql[startIndex] !== "$") {
    return null
  }

  let endIndex = startIndex + 1

  while (endIndex < sql.length && sql[endIndex] !== "$") {
    if (!isIdentifierChar(sql[endIndex])) {
      return null
    }
    endIndex += 1
  }

  if (endIndex >= sql.length || sql[endIndex] !== "$") {
    return null
  }

  return sql.slice(startIndex, endIndex + 1)
}

export function splitSqlStatements(sql: string): string[] {
  const statements: string[] = []
  let current = ""
  let inSingleQuote = false
  let inDoubleQuote = false
  let inLineComment = false
  let inBlockComment = false
  let dollarQuoteTag: string | null = null

  for (let index = 0; index < sql.length; index += 1) {
    const char = sql[index]
    const nextChar = sql[index + 1]

    if (inLineComment) {
      if (char === "\n") {
        inLineComment = false
        current += char
      }
      continue
    }

    if (inBlockComment) {
      if (char === "*" && nextChar === "/") {
        inBlockComment = false
        index += 1
      }
      continue
    }

    if (dollarQuoteTag) {
      if (sql.startsWith(dollarQuoteTag, index)) {
        current += dollarQuoteTag
        index += dollarQuoteTag.length - 1
        dollarQuoteTag = null
      } else {
        current += char
      }
      continue
    }

    if (!inSingleQuote && !inDoubleQuote) {
      if (char === "-" && nextChar === "-") {
        inLineComment = true
        index += 1
        continue
      }

      if (char === "/" && nextChar === "*") {
        inBlockComment = true
        index += 1
        continue
      }

      const nextDollarQuoteTag = readDollarQuoteTag(sql, index)
      if (nextDollarQuoteTag) {
        dollarQuoteTag = nextDollarQuoteTag
        current += nextDollarQuoteTag
        index += nextDollarQuoteTag.length - 1
        continue
      }
    }

    if (char === "'" && !inDoubleQuote) {
      current += char
      if (inSingleQuote && nextChar === "'") {
        current += nextChar
        index += 1
      } else {
        inSingleQuote = !inSingleQuote
      }
      continue
    }

    if (char === "\"" && !inSingleQuote) {
      current += char
      if (inDoubleQuote && nextChar === "\"") {
        current += nextChar
        index += 1
      } else {
        inDoubleQuote = !inDoubleQuote
      }
      continue
    }

    if (!inSingleQuote && !inDoubleQuote && char === ";") {
      const trimmed = current.trim()
      if (trimmed) {
        statements.push(trimmed)
      }
      current = ""
      continue
    }

    current += char
  }

  const trailingStatement = current.trim()
  if (trailingStatement) {
    statements.push(trailingStatement)
  }

  return statements
}

export function isIgnorableMigrationError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error)

  return [
    "already exists",
    "duplicate",
    "already defined",
  ].some((snippet) => message.includes(snippet))
}
