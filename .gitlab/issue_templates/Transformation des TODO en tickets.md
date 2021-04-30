## Besoin

En tant que développeur, 

Je transforme les `@TODO` présent dans le code

Afin de m'assurer de pas oublier de choses à faire

## Situation

Des annotations sont ajoutée dans le code sans création immédiate de ticket.


## Actions
- [ ] Passer en revue les @TODO dans le code :

  Dans VS Code, faire une recherche avec la regexp suivante, _(attention, ne pas oublier d'activer le mode regexp)_ :

  > @todo [^#]


  La regexp exclue les `@todo` qui on déjà un ticket en référence.


- [ ] Créer les tickets correspondants  
OU
- [ ] Retirer les @TODO obsolètes
- [ ] Ajouter le numéro du ticket à la suite du @todo, avec un dièse, pour que le todo soit exclu des prochaines recherches.
- [ ] Ajouter une annotation `@see` avec le lien vers le ticket gitlab.

  Exemple de todo avant traitement par ce ticket :
  
  ```typescript
  /**
   * @todo do something cool
   */
  ```
  
  Après traitement par ce ticket :
  
  ```typescript
  /**
   * @todo #42 do something cool
   * @see https://gitlab.dev-franceconnect.fr/france-connect/fc/-/issues/42
   */
  ```

/weight 2
/label ~"timebox::1j"
/label ~"typechangement::normal-mineur" ~"♻️ Recurring"
/label ~"Core FCP"
