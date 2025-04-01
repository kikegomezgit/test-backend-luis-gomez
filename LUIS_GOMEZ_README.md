Dificultad pre codificacion:
este ejercicio me fue dificil por que no tenia conocimiento previo de como funcionaban las alineaciones y acciones de los jugadores, asi que me apegue lo mas que pude a lo mas realista y de lo que entendi en una pequeña investigacion.

Redis:
en la implementacion del redis es muy dependiente de que tan "caliente" o que tan usada sera dependiendo del eschema, coloque por default 15 dias a todos, para asi en lo que se puede intuir con los requerimientos los que sean menos usados solos se iran eliminando del redis, en un caso de la vida real se tiene que analizar el uso de la data y que tiempo de vida tiene , por ejemplo un token de validacion de un numero telefonico puede durar 2 horas y esta bien, un precargado de articulos diario, esta bien que dure 24 horas, en este caso es dificil con la poca informacion poder establecer de manera correcta el tiempo de vida ideal para cada data del ejercicio.

Jugadores:
Decidi hacer un upsert, juntar la creacion y update de las alineaciones, debido a que estas solo permito alineaciones completas (de 11 jugadores), asi que si se fuera a cambiar algun jugador siempre estara completa

lineUps
Solo se permite un local y un visitante

Tests con jest
Solo cree pruebas unitarias en las apis "importantes", el deber ser seria en todas pero como es un ejercicio no veo importancia en ser minucioso

comandos a correr en local
// npm run dev
// docker run -d -p 6379:6379 --name redis redis   
// docker-compose up --build
// npm run test