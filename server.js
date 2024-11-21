require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

const csvData = [
  {
    "Scientist": "Alessandra Giliani",
    "Birth Date": "1307",
    "Death Date": "1326",
    "Gender Identity": "Cisgender",
    "Field of Study": "Medicine, Anatomy",
    "Disability Status": "None",
    "Bio": "Alessandra Giliani is often cited as the first female anatomist and prosector. She worked under the renowned anatomist Mondino de' Liuzzi and is credited with developing a method to inject colored fluids into blood vessels for better anatomical study.",
    "Race": "White",
    "Ethnicity": "Italian",
    "Country of Birth": "Italy",
    "Media Coverage": "Limited historical records; her story is mostly reconstructed from secondary sources.",
    "Exposure": "Low",
    "Roles/Positions Held": "Assistant to Mondino de' Liuzzi."
  },
  {
    "Scientist": "Alice Ball",
    "Birth Date": "1892",
    "Death Date": "1916",
    "Gender Identity": "Cisgender",
    "Field of Study": "Chemistry",
    "Disability Status": "NaN",
    "Bio": "American chemist who developed the \"Ball Method,\" a treatment for leprosy.",
    "Race": "Black",
    "Ethnicity": "American",
    "Country of Birth": "United States",
    "Media Coverage": "Posthumous recognition in various articles, books, and documentaries",
    "Exposure": "High, Increasing posthumous recognition; initially low due to the era's racial and gender biases.",
    "Roles/Positions Held": "First woman and first African-American to earn a master's degree from the University of Hawaii; Chemistry instructor at the same institution."
  },
  {
    "Scientist": "Annie M. Alexander",
    "Birth Date": "1867",
    "Death Date": "1950",
    "Gender Identity": "Cisgender",
    "Field of Study": "Paleontology",
    "Disability Status": "NaN",
    "Bio": "Annie M. Alexander was a pioneering paleontologist and philanthropist. She founded the Museum of Vertebrate Zoology and the University of California Museum of Paleontology.",
    "Race": "White",
    "Ethnicity": "Hawaiian",
    "Country of Birth": "Hawaii",
    "Media Coverage": "One biography of her, published in 2001",
    "Exposure": "Moderate; known within academic and museum circles.",
    "Roles/Positions Held": "Founder of major natural history museums"
  },
  {
    "Scientist": "Jocelyn Bell Burnell",
    "Birth Date": "1943",
    "Death Date": "",
    "Gender Identity": "Cisgender",
    "Field of Study": "Astrophysics",
    "Disability Status": "None",
    "Bio": "Irish astrophysicist who discovered the first radio pulsars. Despite her groundbreaking work, she was controversially excluded from the Nobel Prize awarded for this discovery.",
    "Race": "White",
    "Ethnicity": "Irish",
    "Country of Birth": "Northern Ireland",
    "Media Coverage": "High; subject of numerous articles, documentaries, and books",
    "Exposure": "High",
    "Roles/Positions Held": "Professor at the University of Oxford; first female president of the Royal Society of Edinburgh"
  },
  {
    "Scientist": "Jennifer Doudna",
    "Birth Date": "1964",
    "Death Date": "",
    "Gender Identity": "Cisgender",
    "Field of Study": "Biochemistry",
    "Disability Status": "None",
    "Bio": "American biochemist known for her pioneering work in CRISPR gene editing. She was awarded the 2020 Nobel Prize in Chemistry alongside Emmanuelle Charpentier.",
    "Race": "White",
    "Ethnicity": "American",
    "Country of Birth": "United States",
    "Media Coverage": "Very high; frequent media appearances, subject of books and documentaries",
    "Exposure": "Very high",
    "Roles/Positions Held": "Professor at UC Berkeley; co-founder of several biotechnology companies"
  },
  {
    "Scientist": "Emmanuelle Charpentier",
    "Birth Date": "1968",
    "Death Date": "",
    "Gender Identity": "Cisgender",
    "Field of Study": "Microbiology",
    "Disability Status": "None",
    "Bio": "French microbiologist known for her work on the CRISPR-Cas9 gene editing technique. She was awarded the 2020 Nobel Prize in Chemistry alongside Jennifer Doudna.",
    "Race": "White",
    "Ethnicity": "French",
    "Country of Birth": "France",
    "Media Coverage": "Very high; frequent media appearances, subject of scientific articles and news stories",
    "Exposure": "Very high",
    "Roles/Positions Held": "Director at the Max Planck Institute for Infection Biology"
  },
  {
    "Scientist": "Donna Strickland",
    "Birth Date": "1959",
    "Death Date": "",
    "Gender Identity": "Cisgender",
    "Field of Study": "Physics, Optics",
    "Disability Status": "None",
    "Bio": "Canadian optical physicist and pioneer in the field of pulsed lasers. She was awarded the Nobel Prize in Physics in 2018, becoming only the third woman to receive the Physics prize.",
    "Race": "White",
    "Ethnicity": "Canadian",
    "Country of Birth": "Canada",
    "Media Coverage": "High; increased significantly after her Nobel Prize win",
    "Exposure": "High",
    "Roles/Positions Held": "Professor at the University of Waterloo"
  },
  {
    "Scientist": "Shinya Yamanaka",
    "Birth Date": "1962",
    "Death Date": "",
    "Gender Identity": "Cisgender",
    "Field of Study": "Stem Cell Research",
    "Disability Status": "None",
    "Bio": "Japanese stem cell researcher who discovered induced pluripotent stem cells. He was awarded the 2012 Nobel Prize in Physiology or Medicine for this groundbreaking work.",
    "Race": "Asian",
    "Ethnicity": "Japanese",
    "Country of Birth": "Japan",
    "Media Coverage": "Very high; frequent subject of scientific articles and news stories",
    "Exposure": "Very high",
    "Roles/Positions Held": "Director of the Center for iPS Cell Research and Application at Kyoto University"
  },
  {
    "Scientist": "Tu Youyou",
    "Birth Date": "1930",
    "Death Date": "",
    "Gender Identity": "Cisgender",
    "Field of Study": "Pharmaceutical Chemistry",
    "Disability Status": "None",
    "Bio": "Chinese pharmaceutical chemist who discovered artemisinin and dihydroartemisinin, used to treat malaria. She was awarded the 2015 Nobel Prize in Physiology or Medicine.",
    "Race": "Asian",
    "Ethnicity": "Chinese",
    "Country of Birth": "China",
    "Media Coverage": "High; increased significantly after her Nobel Prize win",
    "Exposure": "High",
    "Roles/Positions Held": "Chief Scientist at the China Academy of Traditional Chinese Medicine"
  },
  {
    "Scientist": "May-Britt Moser",
    "Birth Date": "1963",
    "Death Date": "",
    "Gender Identity": "Cisgender",
    "Field of Study": "Neuroscience",
    "Disability Status": "None",
    "Bio": "Norwegian psychologist and neuroscientist who discovered grid cells in the brain. She was awarded the 2014 Nobel Prize in Physiology or Medicine alongside her then-husband Edvard Moser.",
    "Race": "White",
    "Ethnicity": "Norwegian",
    "Country of Birth": "Norway",
    "Media Coverage": "High; frequent subject of scientific articles and news stories",
    "Exposure": "High",
    "Roles/Positions Held": "Professor at the Norwegian University of Science and Technology"
  },
  {
    "Scientist": "Emmanuelle Pouydebat",
    "Birth Date": "1976",
    "Death Date": "",
    "Gender Identity": "Cisgender",
    "Field of Study": "Evolutionary Biology",
    "Disability Status": "None",
    "Bio": "French evolutionary biologist known for her work on animal and human motor skills. She has conducted extensive research on grasping abilities across various species.",
    "Race": "White",
    "Ethnicity": "French",
    "Country of Birth": "France",
    "Media Coverage": "Moderate; known within scientific circles and occasionally featured in science media",
    "Exposure": "Moderate",
    "Roles/Positions Held": "Research Director at the French National Centre for Scientific Research (CNRS)"
  },
  {
    "Scientist": "Siqi Li",
    "Birth Date": "1986",
    "Death Date": "",
    "Gender Identity": "Cisgender",
    "Field of Study": "Quantum Computing",
    "Disability Status": "None",
    "Bio": "Chinese-American physicist working on quantum computing and quantum information. Her research focuses on developing new quantum algorithms and error correction techniques.",
    "Race": "Asian",
    "Ethnicity": "Chinese-American",
    "Country of Birth": "China",
    "Media Coverage": "Moderate; featured in scientific publications and occasionally in tech media",
    "Exposure": "Moderate",
    "Roles/Positions Held": "Assistant Professor at Stanford University"
  },
  {
    "Scientist": "Sabrina Gonzalez Pasterski",
    "Birth Date": "1993",
    "Death Date": "",
    "Gender Identity": "Cisgender",
    "Field of Study": "Theoretical Physics",
    "Disability Status": "None",
    "Bio": "American theoretical physicist known for her work on high energy physics and black holes. She has been called the \"next Einstein\" by some in the scientific community.",
    "Race": "Hispanic",
    "Ethnicity": "Cuban-American",
    "Country of Birth": "United States",
    "Media Coverage": "High; subject of numerous articles and featured in various media outlets",
    "Exposure": "High",
    "Roles/Positions Held": "Postdoctoral researcher at Princeton University"
  },
  {
    "Scientist": "Boyana Konforti",
    "Birth Date": "1987",
    "Death Date": "",
    "Gender Identity": "Cisgender",
    "Field of Study": "Molecular Biology",
    "Disability Status": "None",
    "Bio": "Bulgarian-American molecular biologist studying RNA splicing and gene regulation. Her work has implications for understanding and treating genetic diseases.",
    "Race": "White",
    "Ethnicity": "Bulgarian-American",
    "Country of Birth": "Bulgaria",
    "Media Coverage": "Moderate; featured in scientific journals and occasionally in science media",
    "Exposure": "Moderate",
    "Roles/Positions Held": "Assistant Professor at Rockefeller University"
  },
  {
    "Scientist": "Radhika Nagpal",
    "Birth Date": "1972",
    "Death Date": "",
    "Gender Identity": "Cisgender",
    "Field of Study": "Computer Science",
    "Disability Status": "None",
    "Bio": "Indian-American computer scientist and roboticist known for her work on self-organizing multi-agent systems and bio-inspired robotics.",
    "Race": "Asian",
    "Ethnicity": "Indian-American",
    "Country of Birth": "India",
    "Media Coverage": "Moderate; known within robotics and AI circles, occasionally featured in tech media",
    "Exposure": "Moderate",
    "Roles/Positions Held": "Professor at Harvard University"
  },
  {
    "Scientist": "Maryam Mirzakhani",
    "Birth Date": "1977",
    "Death Date": "2017",
    "Gender Identity": "Cisgender",
    "Field of Study": "Mathematics",
    "Disability Status": "None",
    "Bio": "Iranian mathematician and the first woman to win the Fields Medal. Her work focused on the dynamics and geometry of Riemann surfaces and their moduli spaces.",
    "Race": "Middle Eastern",
    "Ethnicity": "Iranian",
    "Country of Birth": "Iran",
    "Media Coverage": "High; increased significantly after winning the Fields Medal",
    "Exposure": "High",
    "Roles/Positions Held": "Professor at Stanford University"
  },
  {
    "Scientist": "Joy Buolamwini",
    "Birth Date": "1989",
    "Death Date": "",
    "Gender Identity": "Cisgender",
    "Field of Study": "Computer Science",
    "Disability Status": "None",
    "Bio": "Ghanaian-American computer scientist and digital activist known for her work on algorithmic bias, particularly in facial recognition systems.",
    "Race": "Black",
    "Ethnicity": "Ghanaian-American",
    "Country of Birth": "Canada",
    "Media Coverage": "High; featured in numerous articles, documentaries, and TED talks",
    "Exposure": "High",
    "Roles/Positions Held": "Founder of the Algorithmic Justice League"
  },
  {
    "Scientist": "Burçin Mutlu-Pakdil",
    "Birth Date": "1987",
    "Death Date": "",
    "Gender Identity": "Cisgender",
    "Field of Study": "Astrophysics",
    "Disability Status": "None",
    "Bio": "Turkish astrophysicist known for her discovery of a rare double-ringed elliptical galaxy, now called Burçin's Galaxy.",
    "Race": "Middle Eastern",
    "Ethnicity": "Turkish",
    "Country of Birth": "Turkey",
    "Media Coverage": "Moderate; featured in scientific publications and occasionally in popular science media",
    "Exposure": "Moderate",
    "Roles/Positions Held": "Postdoctoral researcher at the University of Arizona"
  },
  {
    "Scientist": "Esther Duflo",
    "Birth Date": "1972",
    "Death Date": "",
    "Gender Identity": "Cisgender",
    "Field of Study": "Economics",
    "Disability Status": "None",
    "Bio": "French-American economist known for her work on poverty alleviation. She was awarded the 2019 Nobel Prize in Economics, becoming the youngest person to receive the Economics prize.",
    "Race": "White",
    "Ethnicity": "French",
    "Country of Birth": "France",
    "Media Coverage": "Very high; frequent media appearances, subject of numerous articles and interviews",
    "Exposure": "Very high",
    "Roles/Positions Held": "Professor at MIT; Co-founder and co-director of the Abdul Latif Jameel Poverty Action Lab"
  },
  {
    "Scientist": "Nergis Mavalvala",
    "Birth Date": "1968",
    "Death Date": "",
    "Gender Identity": "Cisgender",
    "Field of Study": "Astrophysics",
    "Disability Status": "None",
    "Bio": "Pakistani-American astrophysicist known for her role in the first observation of gravitational waves. She is also known for her work on quantum measurement science.",
    "Race": "Asian",
    "Ethnicity": "Pakistani-American",
    "Country of Birth": "Pakistan",
    "Media Coverage": "High; featured in numerous scientific articles and news stories",
    "Exposure": "High",
    "Roles/Positions Held": "Dean of the School of Science at MIT"
  },
  {
    "Scientist": "Gitanjali Rao",
    "Birth Date": "2005",
    "Death Date": "",
    "Gender Identity": "Cisgender",
    "Field of Study": "Inventor",
    "Disability Status": "None",
    "Bio": "American inventor and scientist known for inventing a lead detection device and an app to detect cyberbullying. She was named TIME Magazine's first Kid of the Year in 2020.",
    "Race": "Asian",
    "Ethnicity": "Indian-American",
    "Country of Birth": "United States",
    "Media Coverage": "High; featured in numerous articles, interviews, and a TIME Magazine cover",
    "Exposure": "High",
    "Roles/Positions Held": "Student; Inventor; STEM advocate"
  }
];

// Route to serve CSV data
app.get('/api/csv-data', (req, res) => {
  res.json(csvData);
});

app.post('/api/chat', async (req, res) => {
  try {
    const { message } = req.body;
    console.log('Received message:', message);

    const prompt = `You are an AI assistant trained on information about scientists. Use the following CSV data to answer questions:\n\n${JSON.stringify(csvData)}\n\n You can use outside internet context to answer the questions, please don't limit yourself to the csv data. User: ${message}\nAI:`;
    console.log('Generated prompt:', prompt);

    const response = await axios.post(OPENAI_API_URL, {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ]
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    console.log('OpenAI API response:', response.data);

    const aiMessage = response.data.choices[0].message.content.trim();
    res.json({ message: aiMessage });
  } catch (error) {
    console.error('Detailed error:', error);
    if (error.response) {
      console.error('Error response:', error.response.data);
    }
    res.status(500).json({ error: 'An error occurred while processing your request.', details: error.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
