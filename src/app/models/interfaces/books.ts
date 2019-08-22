/**
 * A descrição de um livro
 */
export interface BookDescription {
  /**
   * O texto da coluna
   */
  column: string;

  /**
   * O valor da descrição
   */
  value: string;
}

/**
 * As informações obtida dos livros do pergamum
 */
export interface BookDetails {
  /**
   * A imagem do livro
   */
  img: string;

  /**
   * As descrições dos livros
   */
  descriptions: BookDescription[];
}
