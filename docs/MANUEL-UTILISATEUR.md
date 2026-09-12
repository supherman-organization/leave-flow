# Manuel utilisateur — Leave Flow

Guide d'utilisation de la plateforme de gestion des congés de SUP Herman.

---

## Les trois rôles

Votre rôle est attribué par le service RH et détermine les menus affichés.

| Rôle | Ce que vous pouvez faire |
| --- | --- |
| **Employé** | Consulter votre solde, déposer des demandes, les suivre, annuler une demande non traitée |
| **Manager** | Tout ce qui précède + valider ou refuser les demandes de votre équipe |
| **RH** | Tout ce qui précède + créer et gérer les comptes, corriger toute demande |

---

## Première connexion

Vous ne pouvez pas créer votre compte. Le service RH vous transmet votre **email
professionnel** et un **mot de passe temporaire**.

1. Ouvrir `http://localhost:5174`
2. Saisir l'email et le mot de passe temporaire, puis **Se connecter**
3. Choisir votre mot de passe définitif — **8 caractères minimum** — et le confirmer


Lors des connexions suivantes, utilisez ce nouveau mot de passe.

**Mot de passe oublié** — contactez le service RH, qui le réinitialisera.

---

## Repères communs

**La barre latérale** regroupe la navigation en deux blocs : *Mon Espace* pour ce
qui vous concerne personnellement, *Administration* pour les écrans de gestion.
Seules les entrées correspondant à vos droits apparaissent.

**Sur mobile**, la barre se replie : le bouton en haut à gauche l'ouvre en tiroir.

**Les messages** apparaissent en haut à droite après chaque action — vert en cas
de réussite, rouge en cas de problème.

**Les statuts**

| Statut | Signification |
| --- | --- |
| **En attente** | Déposée, pas encore traitée |
| **Validé** | Acceptée, les jours sont décomptés |
| **Refusé** | Rejetée, le motif figure dans le détail |
| **Annulé** | Retirée par son auteur avant traitement |

---

## Guide de l'employé

### Tableau de bord

Écran d'accueil après connexion. Il affiche votre solde de congés, le nombre de
demandes en cours, vos prochaines absences validées et vos demandes récentes.


### Déposer une demande

Menu **Nouvelle demande**.

**1. Type de congé**

| Type | Usage |
| --- | --- |
| Congés Payés (CP) | Congés annuels, décomptés du solde CP |
| RTT | Décomptés du solde RTT |
| Sans solde | Absence non rémunérée, aucun décompte |
| Maladie | Justificatif à joindre |
| Formation | Absence pour formation |

**2. Dates** — début et fin. Pour une seule journée, indiquer la même date.

**3. Demi-journées** — départ *l'après-midi* ou retour *le matin* retirent une
demi-journée du décompte. Par défaut, les journées sont entières.

**4. Vérifier le résumé** — le panneau de droite affiche le nombre de jours
décomptés en temps réel. **Les week-ends ne sont jamais comptés** : du vendredi
au lundi représente 2 jours, non 4.

**5. Commentaire et justificatif** — facultatifs, sauf justificatif pour un arrêt
maladie. Formats PNG, JPG ou PDF, 5 Mo maximum.

**6. Soumettre** — la demande part au statut *En attente*.


**Si la demande est refusée à la saisie**

| Message | Solution |
| --- | --- |
| Date de fin antérieure à la date de début | Corriger l'ordre des dates |
| Durée nulle | Période sur un week-end ou demi-journées s'annulant : ajuster |
| Chevauchement | Une demande couvre déjà ces dates : la consulter et l'annuler si besoin |

### Suivre et annuler vos demandes

L'écran **Mes demandes** liste vos demandes avec leur statut. L'onglet *En
attente* isole celles non traitées ; un clic sur un en-tête de colonne trie la
liste ; le bouton **Détails** ouvre la fiche complète, où figure le **commentaire
du responsable** en cas de refus.


Pour annuler : ouvrir le détail, puis **Annuler cette demande**. Possible
uniquement tant que la demande est *En attente*. Le solde reste inchangé,
puisqu'aucun jour n'avait été décompté.

Une demande déjà traitée ne peut plus être annulée : s'adresser au service RH.

### Calendrier des absences

L'écran **Calendrier global** présente les absences **validées** du mois, avec
une couleur par type de congé. Les flèches changent de mois, le menu *Équipe*
filtre l'affichage, les jours fériés portent la mention *Férié*.

Utile avant de déposer une demande : il révèle les périodes déjà chargées.


### Profil

Vos informations, vos soldes et votre historique de connexion. Pour changer votre
mot de passe : saisir l'actuel, puis le nouveau deux fois.

Les informations personnelles sont en lecture seule — toute correction relève du
service RH.


---

## Guide du manager

Vous disposez de toutes les fonctions de l'employé, plus le traitement des
demandes de votre équipe. Votre tableau de bord comporte un indicateur
supplémentaire : **À traiter**.

### Traiter les demandes

L'écran **Gestion des demandes** liste les demandes des collaborateurs dont vous
êtes le manager désigné. Les autres demandes de l'entreprise ne vous sont pas
accessibles.


**Filtres disponibles** : recherche par nom, statut, type, date de début, date de
fin. Pour traiter votre file, sélectionner le statut *En attente*.

**Consulter le détail** — l'icône en forme d'œil ouvre la fiche : période exacte,
commentaire du collaborateur, justificatif éventuel.

**Valider** — icône verte en forme de coche. Les jours sont automatiquement
décomptés du solde du collaborateur, s'il s'agit de CP ou de RTT.

**Refuser** — icône rouge en forme de croix. Un **motif est obligatoire** : le
collaborateur le retrouvera dans le détail de sa demande. Rédiger un motif
explicite plutôt qu'un simple « refusé ».

**Une décision est définitive.** En cas d'erreur, solliciter le service RH, seul
habilité à corriger un statut.

### Vos propres demandes

Vous les déposez comme tout collaborateur. Vous ne pouvez pas valider vos propres
demandes : elles sont traitées par votre responsable ou par les RH.

---

## Guide du responsable RH

Vous disposez de toutes les fonctions, sur le périmètre complet de l'entreprise.

| Fonction | Manager | RH |
| --- | --- | --- |
| Demandes visibles | Son équipe | Toute l'entreprise |
| Corriger une demande traitée | ❌ | ✅ |
| Gérer les comptes | ❌ | ✅ |

### Créer un compte

Écran **Gestion des utilisateurs**, bouton **Créer un utilisateur**.


| Champ | Remarque |
| --- | --- |
| Prénom, Nom | Obligatoires |
| Email | Obligatoire, unique, sert d'identifiant |
| Rôle | Employé, Manager ou RH |
| Équipe | Facultatif, utilisé par le filtre du calendrier |
| Manager responsable | Détermine qui traitera les demandes du collaborateur |

Sans manager désigné, les demandes du collaborateur n'apparaîtront dans la file
d'aucun responsable et devront être traitées par les RH.

**Le mot de passe temporaire** s'affiche à la validation. Le bouton **Copier** le
place dans le presse-papiers. Il n'est **affiché qu'une seule fois** : en cas de
perte, procéder à une réinitialisation.

### Gérer les comptes

| Action | Icône | Effet |
| --- | --- | --- |
| Modifier | Crayon | Corriger nom, email, rôle, équipe ou manager |
| Réinitialiser | Clé | Génère un nouveau mot de passe temporaire, l'ancien cesse de fonctionner |
| Activer / désactiver | Interrupteur | Bloque la connexion **en conservant tout l'historique** |

La désactivation est la manière recommandée de traiter un départ : elle préserve
les demandes passées et la cohérence du calendrier.

### Corriger une demande traitée

Depuis **Gestion des demandes**, bouton **Modifier** : sélectionner le nouveau
statut et joindre un commentaire.

> **Attention** — cette correction **n'ajuste pas le solde de congés**. Si vous
> repassez une demande validée à un autre statut, les jours décomptés ne sont pas
> restitués : vérifier et corriger le solde manuellement.

Réserver cette fonction aux corrections d'erreurs : le circuit normal
— validation par le manager — doit rester la règle.

---

## Questions fréquentes

**Pourquoi ne puis-je pas créer mon compte ?**
Les comptes sont créés par les RH, afin que chaque collaborateur soit rattaché à
son manager et doté de son solde.

**J'ai oublié mon mot de passe.**
Contactez les RH pour une réinitialisation.

**Ma demande est bloquée pour chevauchement.**
Une demande existante couvre déjà ces dates. Consultez *Mes demandes* et annulez
celle qui n'est plus d'actualité.

**Pourquoi ma demande du vendredi au lundi ne compte-t-elle que 2 jours ?**
Les week-ends ne sont jamais décomptés.

**Mon solde n'a pas bougé après l'annulation de ma demande.**
Normal : les jours ne sont décomptés qu'à la **validation**. Une demande annulée
en attente n'a jamais entamé votre solde.

**Mon solde n'a pas été restitué après l'annulation d'un congé validé.**
La correction d'une demande validée n'ajuste pas automatiquement le solde :
signalez-le aux RH.

**Puis-je modifier une demande déposée ?**
Non. Annulez-la tant qu'elle est en attente, puis déposez-en une nouvelle.

**Je suis manager mais la liste des demandes est vide.**
Vous ne voyez que les collaborateurs dont vous êtes le manager désigné. Les RH
peuvent vérifier ces affectations.

**Le calendrier n'affiche pas la demande que je viens de déposer.**
Seuls les congés **validés** y figurent.

**L'application fonctionne-t-elle sur téléphone ?**
Oui, tous les écrans s'adaptent aux téléphones et tablettes.