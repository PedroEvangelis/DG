## Foco

Este teste avaliará questões relacionados a análise de software, organização e regras de negócio.

Todo o sistema e dados será acessível após o usuário estar logado.

## Requisitos

### Arquiteturais

- Front-end e back-end separados, de modo que possam ser hospedados até mesmo em servidores distintos.

### De Negócio

- Login
- CRUD de Usuários
	- *<Caso Pessoa Física>*
		- Nome
		- Nascimento
		- CPF
		- Gênero
	- *<Caso Pessoa Jurídica>*
		- Razão Social
		- Nome Fantasia
		- CNPJ
	- Email
	- Endereço
		- CEP
		- Logradouro
		- Bairro
		- Número
		- Complemento
		- Estado
		- Cidade
	- Situação (Status)
		- Ativo
		- Inativo
- Níveis de Permissão
	- Simples
	- Administrador
- Integrações com APIs públicas
	- [ViaCEP](https://viacep.com.br/), para consulta de endereços;
	- [ReceitaWS](https://developers.receitaws.com.br/#/operations/queryRFFree), para consulta de CNPJ.
- Documentação;
- Organização.

## Descrição

### Login

Usuários devem acessar o sistema utilizando Email e senha, contanto que não estejam inativos.

### CRUD de Usuários

Usuários serão divididos em dois tipos: Pessoas Físicas e Pessoas Jurídicas. O tipo do usuário deverá ser definido durante sua criação, e nunca mais alterado.

Existirá permissões de usuários "Administrador" e usuários "Simples". Usuários poderão ver os dados de outros usuários, e até mesmo modificar-los dependendo de sua permissão. Porém analise a aplique regras para que não haja abusos no sistema, como usuários vendo dados sensíveis ou alterando as próprias permissões.

É importante que os usuários possam alterar suas próprias senhas, porém também é interessante uma maneira de Administradores resetarem a senha dos usuários, caso a esqueçam. As senhas devem ser geradas aleatoriamente.

> Não é necessário implementar envio de email. O Administrador pode enviar a senha manualmente para o usuário.

Administradores podem apagar usuários do sistema, contudo, certifique-se de aplicar a técnica de soft-delete no banco de dados, para evitar que os dados sejam apagados imediatamente.

#### Validação

Os seguintes campos são obrigatórios:

- Email
- *<Caso Pessoa Física>*
	- CPF
	- Nome
- *<Caso Pessoa Jurídica>*
	- Razão Social
	- Nome Fantasia
	- CNPJ

Todos os campos devem possuir as validações aplicáveis; até mesmo campos opcionais, caso possuam valor. Por exemplo: o CPF e CNPJ devem ser válidos, e o CEP ter o formato correto.

Os campos Email, CPF e CNPJ devem ser únicos; ou seja, não pode conter usuários existentes com tais informações duplicadas.

> Não se esqueça de deixar claro ao usuário quais campos estão inválidos, e seus motivos.

### Informações Vagas

Algumas informações foram deixadas propositalmente vagas para analisar qual estratégia será utilizada na solução. Pense em quesitos de segurança, usuários mal-intencionados, e como implementar/limitar as permissões.

Ação                                 | Simples | Administrador
-------------------------------------|:-------:|:-------------:
Criar usuários                       |    ❌  	|       ✅
Deletar usuários                     |    ❌   |       ✅
Inativar usuários                    |    ❌   |       ✅
Editar dados próprios                |    ✅   |       ✅
Editar dados de outros               |    ❌   |       ✅
Visualizar dados próprios            |    ✅   |       ✅
Visualizar dados de outros           |    ✅   |       ✅
Visualizar dados sensíveis de outros |    ❌   |       ✅
Alterar permissões próprias          |    ❌   |       ✅
Alterar permissões de outros         |    ❌   |       ✅
Alterar própria senha                |    ✅   |       ✅
Resetar senha de usuários            |    ❌   |       ✅

### Integrações com APIs públicas

As APIs públicas citadas devem ser integradas para consulta de endereço por CEP e dados da empresa por CNPJ.

### Documentação

As rotas da API devem ser documentadas utilizando algum método de documentação, porém deve ser no mínimo acessível um arquivo de especificação no padrão OpenAPI (Swagger), ou uma página web com tal documentação (`/api/docs`).

### Organização

Não é imposto nenhuma filosofia/padrão específico de organização do projeto. Apenas o tenha organizado e coerente.

## UI

Mantenha a interface do sistema direta e intuitiva, pensando em usuários sem tanto conhecimento técnico.

## Liberdades

Não há requisitos de tecnologias ou frameworks específicos para o front-end ou back-end. Utilize o que se sentir mais confortável.

## Bônus

- Diagrama de Entidade e Relacionamento (DER) do esquemático do banco de dados;
- Back-end intermediando acesso às APIs públicas, ao invés de realizadas direto pelo front-end.

## Entrega

O código deve estar disponível nesta mesma plataforma de versionamento de código, contendo no README todas as instruções necessárias para colocar o projeto em execução.

Na primeira execução ao menos um usuário administrador deve ser criado automaticamente, com credenciais documentadas no README.