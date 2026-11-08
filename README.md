# Clean Architecture: Product Use Cases

Implementação do desafio Full Cycle em TypeScript, baseada no template obrigatório
[devfullcycle/fc-clean-architecture](https://github.com/devfullcycle/fc-clean-architecture).
O histórico original foi preservado a partir do commit
`4afeebca6b2ed0227e5ebb774db2317d0f9128ee` (`Presenters`).

Os quatro casos de uso seguem a organização de Customer do curso: recebem DTOs,
dependem de `ProductRepositoryInterface` por injeção no construtor e retornam DTOs
sem expor entidades ou modelos de persistência. A entidade `Product` concentra as
validações; a infraestrutura usa Sequelize e SQLite.

## Requisitos e instalação

- Git, Node.js e npm. Validado com Node.js `24.14.1` e npm `11.11.0`.
- As dependências são fixadas pelo `package-lock.json`; utilize `npm ci`.
- Os testes usam SQLite em memória. Não é necessário instalar um servidor de
  banco de dados, configurar variáveis de ambiente ou iniciar a API.

```sh
git clone https://github.com/wagnerdsodre/fc-clean-architecture-product.git
cd fc-clean-architecture-product
npm ci
```

## Executar os testes

Todos os comandos abaixo verificam os tipos com `tsc --noEmit` antes do Jest.

```sh
# Suíte completa, incluindo os testes originais do template
npm test -- --runInBand

# Todos os testes dos quatro casos de uso de Product
npm run test:product

# Somente os testes unitários de Product
npm run test:product:unit

# Somente os testes de integração de Product
npm run test:product:integration

# Testes de Product com exigência de 100% de cobertura
npm run test:coverage
```

Resultado validado: **91 testes na suíte completa**, incluindo **36 testes de
Product** (19 unitários e 17 de integração). Cada caso de uso tem seus próprios
arquivos `.unit.spec.ts` e `.integration.spec.ts`.

O comando de cobertura exige **100% de statements, branches, functions e lines
nos quatro arquivos `*.usecase.ts` de Product**. A configuração dedicada está em
`jest.product.config.ts` e usa o provider Babel para compatibilidade com o Jest do
template no Node.js 24. Esse percentual se refere aos casos de uso adicionados;
o restante do template é validado pela suíte completa.

Relatórios gerados:

- HTML: `coverage/product/lcov-report/index.html`
- LCOV: `coverage/product/lcov.info`
- Resumo JSON: `coverage/product/coverage-summary.json`

## Casos de uso e DTOs

| Caso de uso | Entrada | Saída |
| --- | --- | --- |
| `CreateProductUseCase` | `{ name, price }` | `{ id, name, price }` |
| `FindProductUseCase` | `{ id }` | `{ id, name, price }` |
| `ListProductUseCase` | `{}` | `{ products: [{ id, name, price }] }` |
| `UpdateProductUseCase` | `{ id, name, price }` | `{ id, name, price }` |

- Create gera um UUID para cada novo produto e aguarda sua persistência.
- Find busca pelo ID. Um ID inexistente gera `Product not found`.
- List retorna todos os produtos ou `{ products: [] }` para uma base vazia.
- Update carrega o produto, altera nome e preço pelos métodos da entidade e
  persiste as mudanças mantendo o ID. Um ID inexistente gera `Product not found`.
- As regras existentes do domínio são preservadas: nome vazio e preço negativo
  são rejeitados; preço zero é aceito. A mensagem original para preço negativo
  é `Price must be greater than zero`.

Exemplo de composição com a infraestrutura existente, após inicializar o
Sequelize com `ProductModel`:

```ts
import ProductRepository from "./src/infrastructure/product/repository/sequelize/product.repository";
import CreateProductUseCase from "./src/usecase/product/create/create.product.usecase";
import FindProductUseCase from "./src/usecase/product/find/find.product.usecase";
import ListProductUseCase from "./src/usecase/product/list/list.product.usecase";
import UpdateProductUseCase from "./src/usecase/product/update/update.product.usecase";

async function example() {
  const repository = new ProductRepository();
  const created = await new CreateProductUseCase(repository).execute({
    name: "Product 1",
    price: 10.5,
  });
  const found = await new FindProductUseCase(repository).execute({ id: created.id });
  const updated = await new UpdateProductUseCase(repository).execute({
    id: found.id,
    name: "Updated product",
    price: 20,
  });
  const list = await new ListProductUseCase(repository).execute({});
  return { created, found, updated, list };
}
```

## Organização e estratégia de testes

```text
src/
  domain/product/                        # Entidade e contrato do repositório
  infrastructure/product/repository/
    sequelize/                           # Modelo e repositório reais
  usecase/product/
    create/
      create.product.dto.ts
      create.product.usecase.ts
      create.product.unit.spec.ts
      create.product.integration.spec.ts
    find/                                # Mesma organização
    list/                                # Mesma organização
    update/                              # Mesma organização
```

Os testes unitários usam mocks tipados do contrato do repositório para validar
DTOs, chamadas, UUIDs, regras do domínio e propagação de erros de persistência.
Os testes de integração executam os casos de uso com `ProductRepository`,
Sequelize e SQLite reais, recriam o banco em memória antes de cada teste e fecham
a conexão ao final.

As integrações verificam os dados efetivamente gravados, buscas por ID, listas
vazias e preenchidas, atualizações sem afetar outros produtos e preservação dos
dados armazenados após entradas inválidas. Os testes de cada caso de uso são
independentes dos demais casos de uso.

## Auditoria

O projeto permanece na branch `main`, com um único projeto neste repositório.
Os commits da implementação usam Conventional Commits em inglês: um commit por
caso de uso, incluindo seus DTOs e testes, seguido de commits separados para a
configuração de cobertura e a documentação.

```sh
git log --oneline 4afeebca6b2ed0227e5ebb774db2317d0f9128ee..main
```
