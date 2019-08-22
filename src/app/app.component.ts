//#region Imports

import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';

import { HTMLElement as NodeHTML, parse } from 'node-html-parser';
import { BookDetails } from './models/interfaces/books';
import { PergamumService } from './services/pergamum/pergamum.service';

//#endregion

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
/**
 * A classe que representa a página principal
 */
export class AppComponent {

  //#region Constructor

  /**
   * Construtor padrão
   */
  constructor(
    private pergamum: PergamumService,
  ) { }

  //#endregion

  //#region Public Properties

  /**
   * A lista de livros
   */
  public listBook: BookDetails[] = [];

  /**
   * Diz se está pesquisando um livro
   */
  public isSearching = false;

  //#endregion

  //#region Public Methods

  /**
   * Método que realiza uma pesquisa de livros
   *
   * @param search O termo procurado
   */
  public async performSearch(search: string): Promise<void> {
    if (this.isSearching)
      return;

    this.isSearching = true;
    this.listBook = await this.pergamum.searchBooks(search);
    this.isSearching = false;
  }

  //#endregion

}
