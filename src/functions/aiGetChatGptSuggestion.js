const { app } = require("@azure/functions");
const Openai = require("./utils/openai");
app.http("aiGetChatGptSuggestion", {
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async (request, context) => {
    const response = await Openai.createCompletion({
      model: "text-davinci-003",
      prompt:
        "Write a random text prompt for DALL-E 2 to generate an image, this prompt will be show to the user, include details such as the genre and what type of painting it should be, options may include: oil painting, photo-realistic, 4k, abstract, modern, black and white, do not wrap the anwser in quotes",
      max_tokens: 100,
      temperature: 0.8,
    });
    const responseText = response.data.choices[0].text;
    context.log(`Http function processed request for url "${request.url}"`);

    return { body: `${responseText}` };
  },
});
