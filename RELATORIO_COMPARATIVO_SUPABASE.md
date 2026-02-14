# Análise Comparativa: Supabase vs Alternativas

**Data:** 05/02/2026
**Contexto:** Avaliação para migração ou manutenção do Supabase como backend do projeto ArsInstalacoes.

## 1. Matriz de Decisão Comparativa

| Critério | **Supabase (Atual)** | **Firebase (Google)** | **AWS Amplify** | **PostgreSQL + MinIO (Self)** |
| :--- | :--- | :--- | :--- | :--- |
| **Tipo de Banco** | Relacional (PostgreSQL) | NoSQL (Firestore) | NoSQL (DynamoDB) ou SQL (RDS) | Relacional (PostgreSQL) |
| **Custo Estimado** | **$0 - $25/mês** (Previsível) | Pay-as-you-go (Pode escalar rápido) | Pay-as-you-go (Complexo) | Fixo (VPS: $10-20/mês) |
| **Migração** | N/A (Atual) | **Alta Complexidade** (SQL -> NoSQL) | **Alta Complexidade** | Média (Dump/Restore) |
| **Performance** | Alta (Indexação SQL) | Alta (Leitura), Média (Query complexa) | Alta (Escala Global) | Depende da VPS |
| **Vendor Lock-in** | Baixo (Postgres Open Source) | **Alto** (Proprietário) | **Alto** (Ecossistema AWS) | Nulo |
| **Manutenção** | Baixa (Managed) | Baixa (Managed) | Média/Alta (Configuração) | **Muito Alta** (Updates, Backups) |
| **Storage** | Integrado (S3 wrapper) | Integrado (GCS) | Integrado (S3) | Integrado (MinIO) |

## 2. Análise Detalhada das Alternativas

### Opção A: Firebase (Firestore + Storage)
*   **Prós:** Ecossistema maduro, integração mobile excelente, realtime nativo muito rápido.
*   **Contras:** Modelo de dados NoSQL exigiria reescrever toda a camada de dados da aplicação (hoje baseada em tabelas relacionais). Queries complexas (ex: joins de tabelas) são difíceis ou caras.
*   **Veredito:** **Não Recomendado.** O custo de refatoração do código (React) e modelagem de dados supera os benefícios.

### Opção B: AWS Amplify (Gen 2)
*   **Prós:** Escalabilidade infinita, integração profunda com AWS (Lambda, SES).
*   **Contras:** Curva de aprendizado íngreme. O modelo de precificação pode ser imprevisível. Configuração inicial complexa (Cognito, AppSync).
*   **Veredito:** **Não Recomendado** para o porte atual do projeto. Introduz complexidade desnecessária.

### Opção C: Self-Hosted (PostgreSQL + MinIO + Docker)
*   **Prós:** Custo fixo baixo, controle total, soberania de dados.
*   **Contras:** Você se torna responsável por backups, updates de segurança, patches do SO e monitoramento de uptime.
*   **Veredito:** **Apenas se o custo do Supabase for proibitivo.** Para a maioria dos projetos, o tempo gasto em DevOps custa mais que $25/mês.

## 3. Análise de Risco: Migração
Migrar de Supabase (SQL) para uma solução NoSQL (Firebase/DynamoDB) é classificado como **Risco Alto**.
*   **Tempo estimado:** 3-4 semanas de desenvolvimento (Refatoração de Hooks, Types, Lógica de Componentes).
*   **Riscos:** Perda de integridade referencial, bugs de regressão, perda de funcionalidades RLS.

## 4. Recomendação Final

✅ **MANTER SUPABASE**

**Justificativa:**
1.  **Adequação Tecnológica:** A aplicação já está construída pensando em SQL/Relacional. O Supabase atende perfeitamente.
2.  **Custo-Benefício:** O plano Pro ($25) ou mesmo o Free cobrem com folga o uso atual.
3.  **Produtividade:** O "Developer Experience" do Supabase com TypeScript (`database.types.ts`) é superior para manutenção do código atual.
4.  **Estabilidade:** Os problemas recentes são de infraestrutura DNS do provedor, não limitações da plataforma em si. Podem ser mitigados com estratégias de DNS ou cache, sem necessidade de troca de banco.

### Plano de Ação (Mitigação de Riscos Supabase)
*   **Backup Externo:** Implementar script de dump diário (pg_dump) para um bucket S3 externo (AWS ou Cloudflare R2) para evitar lock-in total de dados.
*   **Monitoramento:** Implementar o sistema de Health Check (Task atual) para detectar falhas rapidamente.
