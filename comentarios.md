 
Comentário: Título do formulário no Campo “RELATÓRIO Nº: “ O Número dever ser do total de dias decorridos com relação a data de início da WORK.

 
Comentário: 
Projeto =  Work.name;
Contratante =  work.contractor
 
Os stage, groups (se tiver) e as atividades devem ser renderizadas, se tiver alguma produção e programação para as datas do relatorio estas torres devem aparecer em “PROD. DIA”, se o status for = EXECUTED, Se o status for = PROGRAMMED devem aparecer em “PLAN. DIA”, se o status for = PROGRESS devem aparecer em “PLAN. DIA”.
EXPLICAÇÃO DOS CAMPOS:
ATIVIDADES: stage ou group ou task;
DATA DE INICIO: data de cadastro da produção (start_time);
DATA TÉRMINO: data de castro da produção (final_time);
UNIDADE: task.unit,
PREVISTO: TOTAL PREVISTO CONFORME TOWERS CADASTRADAS (Se o unit for torre então serão o total de torres cadastradas, se for km então será a soma das distance  cadastradas divido por 1000).
ACUMULADO: Será o total de torres ou kms executados dependendo da unidade da atividade.
% ACUM.: O PERCENTUAL DO EXECUTADO EM RELAÇÃO AO PREVISTO.
PENDENTE: O PREVISTO – O ACUMULADO.
RESPONSAVEL: O LIDER DA EQUIPE QUE EXECUTOU A ATIVIDADE.
 
LICENÇA DE CONSTRUÇÃO:
CONSIDERE APENAS 1.Liberadas, e 2.Embargada, informaçoes das towers, soma de “embargo”.

COMENTARIOS …
Todos comentarios relativos a data de execução.












