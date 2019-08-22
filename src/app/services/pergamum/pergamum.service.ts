//#region Imports

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { HTMLElement as NodeHTML, parse } from 'node-html-parser';

import { BookDetails } from '../../models/interfaces/books';

//#endregion

/**
 * O serviço que lida com a obtençao das informaçoes dos livros
 */
@Injectable({
  providedIn: 'root'
})
export class PergamumService {

  //#region Constructor

  /**
   * Construtor padrão
   */
  constructor(
    private http: HttpClient,
  ) { }

  //#endregion

  //#region Public Methods

  /**
   * Método que retorn as informações de vários livros a partir de um termo de busca
   *
   * @param search O termo de busca
   */
  public async searchBooks(search: string): Promise<BookDetails[]> {
    const searchUrl = this.getSearchPergamumUrl(search);
    const txt = await this.http.get(searchUrl, { responseType: 'text' })
      .toPromise()
      .then(text => text.replace(/^\s*|\s*$/g, ''))
      .then(text => text.substring(0, text.length - 7))
      .catch(() => '');

    const listImages = (parse(txt) as NodeHTML).querySelectorAll('img')
      .map(({ attributes: { src = '' } = {} }) => src.replace(/\\\'/gi, ''));

    const data = this.findAll(/\w[carrega_dados_acervo]+\(\\"([0-9]+)\\"\)/g, txt).map(i => +i[1]);

    const bookDetails = await Promise.all(data.map((bookId, index) => {
        return this.http.get(this.getDetailsUrl(bookId), { responseType: 'text' })
          .toPromise()
          .then(text => text.replace(/^\s*|\s*$/g, ''))
          .then(text => text.substring(13))
          .then(text => text.substring(0, text.length - 7))
          .then(text => parse(text) as NodeHTML)
          .then(html => ({
              img: listImages[index],
              descriptions: html.querySelectorAll('td')
                .filter(item => item.attributes.width)
                .map(item => item.parentNode.childNodes.map(text => text.childNodes[0].childNodes[0]))
                .map(([column, value]) => {
                  const extractValue = node => node.constructor.name === 'HTMLElement'
                    ? extractValue(node.childNodes[0])
                    : node.text;

                  return {
                    column: extractValue(column),
                    value: extractValue(value)
                  };
                })
            } as BookDetails)
          ).catch((error) => ({ error }));
      }
    ));

    return bookDetails.filter((item): item is BookDetails => !item['error']);
  }

  //#endregion

  //#region Private Methods

  /**
   * Método que retorna todas as ocorrencias de um regex
   *
   * @param regexPattern O padrão de regex
   * @param sourceString A string a ser procurada
   */
  private findAll(regexPattern: RegExp, sourceString: string): string[] {
    const output = [];
    let match;

    const regexPatternWithGlobal = RegExp(regexPattern, 'g');
    while (match = regexPatternWithGlobal.exec(sourceString)) {
      // get rid of the string copy
      delete match.input;
      // store the match data
      output.push(match);
    }

    return output;
  }

  /**
   * Método que retorna o url usado para ver a descrição de um livro
   *
   * @param bookId A identificação do livro
   */
  private getDetailsUrl(bookId: number): string {
    return `https://cors-anywhere.herokuapp.com/http://www3.facens.br/pergamum/biblioteca/index.php?`
      + `rs=ajax_dados_acervo`
      + `&rst=`
      + `&rsrnd=1566431117520`
      + `&rsargs[]=${ bookId }`
      + `&rsargs[]=`;
  }

  /**
   * Método que retorna o url usado para pesquisar por livros
   *
   * @param search O termo de busca
   */
  private getSearchPergamumUrl(search: string): string {
    return `https://cors-anywhere.herokuapp.com/http://www3.facens.br/pergamum/biblioteca/index.php?`
      + `rs=ajax_resultados`
      + `&rst=`
      + `&rsrnd=1566425173643`
      + `&rsargs[]=20`
      + `&rsargs[]=0`
      + `&rsargs[]=L`
      + `&rsargs[]=${ search }`
      + `&rsargs[]=`
      + `&rsargs[]=%2C`
      + `&rsargs[]=palavra`
      + `&rsargs[]=`
      + `&rsargs[]=`
      + `&rsargs[]=`
      + `&rsargs[]=`
      + `&rsargs[]=L`
      + `&rsargs[]=`
      + `&rsargs[]=`
      + `&rsargs[]=Obra`
      + `&rsargs[]=5d5dc062b776b`
      + `&rsargs[]=`
      + `&rsargs[]=`
      + `&rsargs[]=`
      + `&rsargs[]=`;
  }

  //#endregion

}
