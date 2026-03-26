const scores = [];

exports.handler = async (event) => {
  const body = JSON.parse(event.body);
  const { nombre, puntaje, cantidad } = body;

  scores.push({ nombre, puntaje, cantidad });
  scores.sort((a, b) => b.puntaje - a.puntaje);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Puntaje guardado", scores }),
  };
};
