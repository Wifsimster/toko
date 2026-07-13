# Sauvegardes de la base de données

La base Tokō contient des **données de santé d'enfants (RGPD art. 9)**. Les
sauvegardes sont donc obligatoirement **chiffrées** (art. 32) et **stockées dans
l'Union européenne** (art. 44+, cf. `docs/hosting-eu.md`).

## Script

`deploy/backup.sh` réalise un `pg_dump` du conteneur `toko-postgres`, chiffre le
flux à la volée en AES-256 (le dump en clair ne touche jamais le disque), écrit
un fichier horodaté et purge les sauvegardes plus anciennes que la fenêtre de
rétention.

Variables :

| Variable | Rôle | Défaut |
|---|---|---|
| `BACKUP_ENCRYPTION_KEY` | passphrase de chiffrement (**requis**) | — |
| `TOKO_BACKUP_DIR` | dossier des sauvegardes | `/opt/toko/backups` |
| `TOKO_PG_CONTAINER` | conteneur Postgres | `toko-postgres` |
| `DB_USER` / `DB_NAME` | identifiants base | `toko` / `toko` |
| `BACKUP_RETENTION_DAYS` | rétention | `30` |

## Planification (cron hôte)

Sauvegarde quotidienne à 02:30, journalisée :

```cron
30 2 * * * BACKUP_ENCRYPTION_KEY=$(cat /opt/toko/secrets/backup.key) /opt/toko/deploy/backup.sh >> /var/log/toko-backup.log 2>&1
```

Le fichier `backup.key` doit être hors du dépôt, en lecture seule root
(`chmod 600`), et **différent** de `DB_ENCRYPTION_KEY`.

## Restauration

```sh
openssl enc -d -aes-256-cbc -pbkdf2 -pass env:BACKUP_ENCRYPTION_KEY \
  -in /opt/toko/backups/toko-YYYYMMDD-HHMMSS.sql.enc \
  | docker exec -i toko-postgres psql -U toko -d toko
```

> Tester la restauration régulièrement : une sauvegarde jamais restaurée n'est
> pas une sauvegarde. Le déploiement (`deploy/deploy.sh`) ne touche jamais
> Postgres ; les sauvegardes sont donc le seul filet de sécurité des données.

## Stockage hors-site

Pour survivre à la perte du serveur, répliquer `TOKO_BACKUP_DIR` vers un stockage
objet **en UE** (Scaleway, OVH, Infomaniak). Les fichiers étant déjà chiffrés,
la copie peut transiter par n'importe quel canal sûr.
