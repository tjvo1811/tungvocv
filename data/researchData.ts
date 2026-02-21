/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/

export interface Section {
  heading?: string;
  body: string;
}

export interface ResearchDocument {
  id: string;
  title: string;
  type: 'Paper' | 'Poster';
  pdfUrl?: string;
  content: Section[];
}

export const govtPaper: ResearchDocument = {
  id: 'govt-paper',
  title: 'Life Expectancy and Air Pollution: A Comparative Analysis of the United States and Chad',
  type: 'Paper',
  pdfUrl: '/documents/Air_Pollution_Analysis.pdf',
  content: [
    {
      heading: 'Abstract',
      body: `In the past decade, air pollution and climate change remain an imperative issue, specifically between Chad and the United States who are both high polluters in the world. Unlike Chad, the United States has a very high life expectancy rate compared to Chad’s very low expectancy rate, almost the lowest in the world. Previous studies have found that Chad’s low life expectancy could be due to many factors outside of just air pollution. This includes lack of forest investments, low socioeconomic status, as well as the poor healthcare system that Chad has on hand. This study utilized a case study approach, comparing the United States and Chad through the methodological lens of Most Similar System Design (MSSD). Two prominent themes emerged among the findings: First, although both countries are high polluters of the world, Chad’s pollution is mostly due to poor socioeconomic statuses while the United States have very loose business regulations that can cause it. Second, Chad’s life expectancy rate is low due to very high infant mortality rate for children under 5. This can also be seen with a positive correlation between a lack of forest investment in Chad as well. Understanding the key to combat these other issues at hand for Chad as well as the United States. There is a chance that both countries, if understood their issue at hand correctly, can improve their lives expectancy.`
    },
    {
      heading: 'Introduction',
      body: `Air pollution still stands as a significant challenge in our current day society. While this issue is affected globally, this paper chose to focus on Chad and the United States alone. It is insightful to specifically focus on these two countries is because Oladimeji (2019) indicates that Chad is classified as a country with a very high air pollution rate with extremely low life expectancy “Pollution is one of the major environmental problems confronting Chad area, this pollution ranges from air pollution to water pollution as well as land pollution. (p. 2)”. Bernard (2001) “Climate change may affect exposures to air pollutant (p. 199)” indicates that the United States on the other hand is also classified as a country with high air pollution levels as well while having a consistently high life expectancy rate. Furthermore, this paper aims to find out as to other potential variables that can affect the correlations. This extends the focus of the study to look at socioeconomic variables. Despite both countries' high levels of air pollution, they demonstrate very different levels of socioeconomic statuses. By recognizing these other variables, the insights of the outcome might lead the study to a more accurate finding on the matter.`
    },
    {
      heading: 'Research Question and Rationale',
      body: `“Comparing major air polluters, the US and Chad, with the objective of increasing life expectancy in developing countries, to what extent, if any, is there a correlation between air pollution and life expectancy? What other factors may account for differences in life expectancy between these major polluters?”`
    },
    {
      heading: 'Research Design and Methodology',
      body: `This research paper is a case study. This paper focuses specifically is on the United States and Chad alone. Oladimeji (2019) Bernard (2001) Recognizes that despite their similarity in high levels of air pollutions, the United States has a very high life expectancy compared to Chad. The country with the lowest life expectancy in the world. As stated by Tellis (1997) a case study is “done by giving special attention to completeness in observation, reconstruction, and analysis of the cases under study. Case study is done in a way that incorporates the views of the "actors" in the case under study.”. This case study uses Most Similar System Design to analyze the correlation if any between air pollution and life expectancy.`
    },
    {
      heading: 'Findings',
      body: `Despite Chad and the United States having similar characteristics such as being high polluters, loose businesses regulations, and long exposure to air pollution, they have a strong difference regarding the issue of life expectancy.

Pollution Levels:
United States: 101 AQI (Unhealthy)
Chad: 192 AQI (Very unhealthy)

Business Regulations:
United States: Government regulation fell to a new low of 28%.
Chad: Chad made starting a business easier by eliminating the requirement for a medical certificate.

Socioeconomic Status (GDP per capita):
United States: $76,329
Chad: $716

Infant Mortality Rate (Under 5):
United States: 6.98 deaths per 1000 birth
Chad: 107.1 deaths per 1000 birth

This strong difference may be the result of socioeconomic status between the United States and Chad. Lee et al. (2023) suggests that “cumulative disadvantage framework... people with low incomes... face multiple circumstances... that make them more vulnerable to the adverse physiological and psychosocial effects of air pollution exposure."`
    },
    {
      heading: 'Conclusion',
      body: `Despite the similarities in being high polluters in the world. The United States and Chad are very different when it comes down to life expectancy. Although, air pollution was a factor of the role, it was only a portion of it. Looking deeper into the socioeconomic state of Chad, we can see that socioeconomic status plays a huge role in a snowball effect of life expectancy in Chad. Furthermore, Oyedele (2023) Chad has a very serious issue when it comes down to the lens of maternal and infant mortality rates and their health statuses. One of the ways that we can help this is by investing in forest expansion. With these issues being recognized, Chad as well as the United States can both better their lives expectancies.`
    }
  ]
};

export const ricePoster: ResearchDocument = {
  id: 'rice-poster',
  title: 'A Systemic Approach to Understanding the Natural World',
  type: 'Poster',
  pdfUrl: '/documents/Rice_Poster.pdf',
  content: [
    {
      heading: 'Introduction',
      body: `My discovery for data science started when I stumbled upon the Google Data Analytics course summer of 2024. From it, I completed multiple of their courses and got certificates for it as well. My passion for data analytics lies within my sense of curiosity and my love for deductive reasoning.

Throughout the course of my life, as I grew up I also developed a hobby for running and with that comes my awareness for the environment and my passion for global warming.

Weaving my passions together, coincidentally, I was offered an opportunity to apply for the Rice Data Academy with sustainability elements. This was nothing short of exciting for me and the exact path of trajectory I want to take with my career.`
    },
    {
      heading: 'Being Aware of Community Environmental Impact',
      body: `Being aware is a key component for the first part. Learning about the fifth ward Kashmere garden with the Union Pacific in the railroad site. For years, residents of the fifth ward couldn't understand why people around were getting cancer. A deeper analysis of environmental soil sampling revealed that properties that were near the Union Pacific Railroad site had dioxins found in all of the soil samples. Dioxin is a highly toxic compound and is associated with liver cancer and other health risks. Union Pacific is now responsible for paying up to 100 million dollars to repair the damage it has caused.

Furthermore, analyzing e-waste in the context of data centers revealed the heat produced by those centers contributing to climate change. That left me with some thought exercise of the fact that ethics to build and develop data centers is becoming more nuanced considering the tradeoffs in need of computational power and climate impact.`
    },
    {
      heading: 'Approach Drives Solution',
      body: `In the second meeting, as we utilized python to visualize data, it changed and challenged my perception of data analysis through coding since I once only thought data analysis was just a bunch of spreadsheet work.

The analysis of motifs and food webs put into a surprising perspective for me on how to use this even outside of a food web ecosystem. An example such as product management on which can be taken off shelves or how companies' products are connected to each other, and which one is most dangerous to be going off sale.

The most important thing here for me is being able to see each step taken very meticulously, in the grand scheme of things, the question of “how can I determine which species will endanger the ecosystem the most?” It is a difficult question. But being able to break that down step by step and quantify it in such a way where each step feels closer to the solution thrills me here.`
    },
    {
      heading: 'The Importance of Data Collection and Unbiased Data',
      body: `Learning about seed dispersal from animals in dead forest areas has shaped my perspective very differently about how animals itself can have a huge impact on the ecosystem. This sparked my interest in ecology and my curiosity to learn more on how animals affect sustainability.

I have gotten the chance to discuss with Dr. Myers about the disinformation in data and how we can combat that. I learned that unbiased data is a very important and complex issue that came down to a lot of factors. When analyzing it, it is a very nuanced problem that requires diversity and inclusion within the field to get all perspectives of the coin in order to keep the data truly unbiased when analyzed by humans that are naturally biased. This led to my realization of the importance of diversity within any workplace or setting in the field of data science.`
    },
    {
      heading: 'Conclusion',
      body: `Throughout this experience, a huge takeaway for me was a systemic approach data. From approaches to tackle data to visualization using codes, it has transformed my views of data analytics in many ways.

Academically, I believe that this experience contributed to my passion in learning about mathematics and how it connects to data analytics. Professionally, it has put even more of a drive and emphasis on me pursuing data analytics and data science. As it pertains to it being more than just spreadsheet work.`
    },
    {
      heading: 'Acknowledgments & References',
      body: `I would like to give special thanks to Google and Rice University for providing me this opportunity to learn more about Data Science through a sustainability lens. Additionally, I would like to thank the Honors College, Dr. Caruso, and Dr. Van De Walker. I also am very grateful to have been selected to be a part of this program, furthering my passion and career in the future. I am especially delighted to have met amazing mentors such as Dr. Masiello and Dr. Myers along the way who completed this program.

"Industry Poisoned a Vibrant Black Neighborhood in Houston. Is a Buyout the Solution?" Houston Public Media, 6 Mar. 2024.
"This Is How We Reduce Data Centers’ Carbon Footprint." SINTEF.`
    }
  ]
};

export const histPaper: ResearchDocument = {
  id: 'hist-paper',
  title: '"The Fortunes of War or the Luck of the Draw": Examining the Influence of Recruitment Tactics on Desertion Rates During the Vietnam War',
  type: 'Paper',
  pdfUrl: '/documents/Vietnam_War_Analysis.pdf',
  content: [
    {
      heading: 'Abstract',
      body: `This research project will explore the differences in recruitment tactics, along with motivations for desertion, among U.S. and Viet Cong soldiers during the Vietnam War. The Viet Cong recruitment tactics would involve targeting the demographics of young men using propaganda or promise of free food or supplies and exploiting the culture of duty and community embedded into Vietnamese culture. On the United States side of the war, they imposed a lottery system with the intent of streamlining the recruitment process and ensuring fairness. However, evidence indicates that this military draft led to significant opposition to the war and a culture of reluctance around military service. Previous research suggests that factors such as race and education affect the likelihood of being drafted. For example, Black high school graduates were more likely to be drafted than their White counterparts. Lack of progress or success in the war led men from both sides to desert their duties, though often for varying reasons. Findings from this study will provide additional insight into the effects of the two countries’ recruiting tactics during wartime and the potential effect of those tactics on desertion trends.`
    },
    {
      heading: 'Introduction',
      body: `The Vietnam War “was a long, costly and divisive conflict that pitted the communist government of North Vietnam against South Vietnam and its principal ally, the United States. The conflict was intensified by the ongoing Cold War between the United States and the Soviet Union.” (Networks 1). The purpose of this paper will be to examine the influence of recruitment tactics due to “[o]ver the fiscal 1965-73 period the Defense Department reports that 495,689 servicemen (and women) on active duty deserted the armed forces.” (Foundation 45). This paper will not only dive into reasons for recruitment tactics leading to desertion rates but also find out the root cause of all these tensions on both the Vietnam and the United States sides. Findings in this paper involve the root cause of the war, and the key high drive of recruitment can be traced to the Cold War.`
    },
    {
      heading: 'Research Question and Rationale',
      body: `My research question for this paper is, “During the Vietnam War, specifically between 1950 and 1975. How has military recruitment tactic affected the desertion rate for soldiers in both Vietnam and The United States?”. In this paper, inspired by my father, and have heard many stories about people from my father’s side of the family fleeing the country and escaping to America by boat. Because of this, there has always been a curiosity as to what happened during the Vietnam War and, most importantly, why my family on my father’s side escaped instead of fighting for their own country.`
    },
    {
      heading: 'Literature Review',
      body: `My primary sources include four propaganda posters, three from Vietnam and one from the United States. Propaganda posters are like ancient art; to understand them, you must learn about their history, which will be delved into. Like art, propaganda conveys feelings, and the utilization of it as a primary source aims to convey myself, as well as the others reading this paper, to get a feel of how people felt during the war. Along with that will be one thesis as a primary source examining the Viet Cong soldiers and their weaknesses. For secondary sources, we will be using one book written by “Bao Ninh was born in Hanoi in 1952. During the Vietnam War he served with the Glorious 27th Youth Brigade. Of the five hundred who went to war with the brigade in 1969, he is one of ten who survived.”`
    },
    {
      heading: 'Findings',
      body: `My findings from the root cause for the desertion rates within the Vietnam War for both Americans and Vietnamese men will be traced back to the Cold War. This war has played a significant role in fueling recruitment tactics and driving desperation to fight in this war. With intensifying ideology “between the United States and the Soviet Union.” The United States was willing to do anything to protect itself against communism.
      
      Andrew Cooley’s thesis examines the Viet Cong soldiers' strengths and weaknesses. He discussed the Viet Cong’s “manpower sources and recruiting techniques... The “Viet Cong recruit soldiers from both North and South Vietnam” (Cooley 37). Although this keeps their options open, they have specific tactics for Northern recruitment. People recruited in the “North are trained there and then infiltrated south to join their units."
      
      Inequality began to happen as men were able to dodge the draft by attending “graduate school” (Shields 216). The burden of the draft “did not fall evenly upon young men ... Individuals who unfortunately possessed combinations of draft vulnerable personal characteristics” (Shields 215) were set to pay a higher price, such as “black high school students” (Shields 224).`
    },
    {
      heading: 'Conclusion',
      body: `Despite both being ideologically different, in terms of when the citizens are fighting the war, these men both are victims of war. This research project explored the differences in recruitment tactics, along with motivations for desertion, among U.S. and Viet Cong soldiers during the Vietnam War. My findings have concluded that the root cause of all this tension is rooted in the Cold War between the United States and the Soviet Union. This ideological war has led to a huge push in recruitment tactics within both the United States and Vietnam. As such, this push has affected the lives of men across the war. Some on the United States side deserted to Canada, and some on the Vietnam side just escaped the war all in general. From seeing the unfairness in the draft system within the United States to the harsh conditions within the Viet Cong Army, this understanding will feed into further research in the future.`
    }
  ]
};

export const nmunPaper: ResearchDocument = {
  id: 'nmun-paper',
  title: '"Genuine": The power of intercultural communication at National Model United Nations',
  type: 'Paper',
  pdfUrl: '/documents/NMUN_Research.pdf',
  content: [
    {
      heading: 'Introduction',
      body: `National Model United Nation – New York is a collegiate level of Model United Nations in New York City involving universities and students from all international backgrounds. It “promotes students' learning opportunities in three successive ways: optimizing individual development through unmoderated caucus, growing competitiveness through working paper forum and sharpening problem-solving skill through draft -resolution forum”. While it is a simulation of the United nation, this is a conference where students can foster and hone important skills such as public speaking and leadership skills.

In what follows throughout this paper, using autoethnography, I will dive into my experience as a delegate at the National Model United Nation – New York conference. The paper will also take a deeper look into and analyze position papers. Analyzing what makes a good speaker and leader when it comes down to a room full of people who are trained to do just that. Emphasizing how you can stand out and captivate people into doing what you want them to do.`
    },
    {
      heading: 'Literature Review',
      body: `Introduction to ethnography and autoethnography:
Exploring the world of ethnography, Conquergood introduced the idea of ethnography to us as a type of study that involved being in the environment that you are observing. But in their effort to understand the complexities on human beings outside of the average society, ethnographers “surrender themselves … to get close to the face of humanity where life is not always pretty”.

Leadership styles and theories:
Leadership in politics and sports plays a crucial role in how successful the team can become. There are more popular leadership theories that are mostly agreed upon by Sihame, Khan, and Harrison including great man theory, behavioral theory, situational/contingent theory, and transactional or transformational theory. One more theory that I also think is important is relational theory, stated by Uhl-Bien “Relationships—rather than authority, superiority, or dominance—appear to be key to new forms of leadership” that can lead us to a more effective way of leading others who feels like they need to be acknowledged.`
    },
    {
      heading: 'Methodology',
      body: `The methodology that will be chosen for this paper will be ethnography. This led me to believe that ethnography is a type of research that implore the kind of need to be inside of the environment you are seeking to research in. That means if a person wants to research what it is like to be a Model United Nation delegate at the New York conference. They would be a delegate or observe all the other delegates in the back of a committee room and note things going on around the room. This year’s National Model United Nation team at Lone Star consists of roughly 30 members including alternates that were there to help.`
    },
    {
      heading: 'Data Analysis',
      body: `Position papers are one crucial part of this conference, the submission happens before the conference itself starts. Position papers “consist information outlining each delegation’s policies on the topic being discussed in their specific committee. The position paper helps delegates organize their ideas and share their foreign policy with the rest of the committee.”

Diving into comparative analysis, I have chosen 2 position papers from my committee that won the position paper award. The position papers are chosen from the delegation of France at Baylor University and from the delegation of Uruguay at University of Regensburg. Comparing this to my partner and I’s position paper, I realized that our third and second paragraph was weak due to being a bit vague on the actions being taken at hand in the second paragraph.

Assessing the data above, I was able to conclude that all the paragraphs in the position papers are important and crucial to what makes an outstanding position paper. The third paragraph is the most important, as it sums up what the paper is about and gives solutions to the topic. It is important that conciseness, details, and relatability to your assigned country or NGO.`
    },
    {
      heading: 'Autoethnography & Experience',
      body: `“NMUN is how I scratch my Speech and Debate itch” was the most accurate quote I have heard that applied to myself. This experience was nothing short of amazing; it provided me with a new atmosphere to learn and excel in.

Competition Ready:
March 24th, 2024, I initially thought I would be a lot more nervous walking into the competition because I still had no clue what I was doing. To my surprise, I was not a single ounce nervous walking into my first session that night, if anything, I felt confident with nothing to back up the confidence.

“The people who win in life aren’t the one who works the hardest, it’s the ones who knows how to play the game” was something our coach told us. Firmly believing that relational leadership theory is what works best, I implemented it throughout the competition from the very first informal session. Instead of being too focused on position papers, when I realized we have some time left in the informal sessions, I tend to use that time to get to know the people that I’ve talked to.

Debrief sessions are one of the most important things that was able to keep me sharp and confident throughout the whole conference. Dr. Tiffee provide us with a checklist for the sessions and at`
    }
  ]
};
