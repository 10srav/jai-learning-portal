export interface Resource {
  title: string
  type: 'video' | 'website' | 'pdf' | 'practice'
  url: string
  description: string
  icon: string
}

export const subjectResources: Record<string, Resource[]> = {
  mathematics: [
    {
      title: 'Khan Academy - Class 10 Math',
      type: 'website',
      url: 'https://www.khanacademy.org/math',
      description: 'Complete mathematics course with practice problems',
      icon: '🎓'
    },
    {
      title: 'NCERT Math Solutions',
      type: 'video',
      url: 'https://www.youtube.com/playlist?list=PLVLoWQFkZbhXFt3SqSgXqyqSlLufsjvQY',
      description: 'Chapter-wise NCERT solutions explained',
      icon: '📹'
    },
    {
      title: 'Vedantu Math Class 10',
      type: 'video',
      url: 'https://www.youtube.com/c/VedantuMath',
      description: 'Live classes and doubt solving sessions',
      icon: '🔴'
    },
    {
      title: 'Math Practice Tests',
      type: 'practice',
      url: 'https://www.toppr.com/class-10/maths/',
      description: 'Mock tests and sample papers',
      icon: '📝'
    },
  ],
  science: [
    {
      title: 'Physics Wallah - Class 10',
      type: 'video',
      url: 'https://www.youtube.com/c/PhysicsWallah',
      description: 'Physics, Chemistry, Biology complete course',
      icon: '🔬'
    },
    {
      title: 'BYJU\'S Science',
      type: 'website',
      url: 'https://byjus.com/cbse-class-10-science/',
      description: 'Interactive lessons and animations',
      icon: '🧪'
    },
    {
      title: 'NCERT Science Textbook',
      type: 'pdf',
      url: 'https://ncert.nic.in/textbook.php?jesc1=0-16',
      description: 'Official NCERT Science textbook PDF',
      icon: '📚'
    },
    {
      title: 'Unacademy Science',
      type: 'video',
      url: 'https://www.youtube.com/c/UnacademyClass910',
      description: 'Detailed explanations of all chapters',
      icon: '🎬'
    },
  ],
  english: [
    {
      title: 'English Grammar Basics',
      type: 'video',
      url: 'https://www.youtube.com/playlist?list=PLd3UqWTnYXOmx_J1774ukG_rvrpyWczm0',
      description: 'Grammar concepts and exercises',
      icon: '📖'
    },
    {
      title: 'Literature Study',
      type: 'website',
      url: 'https://www.learncbse.in/cbse-class-10-english/',
      description: 'Chapter summaries and question answers',
      icon: '📚'
    },
    {
      title: 'Writing Skills',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=VfOMYwkhKTQ',
      description: 'Essay writing, letter writing techniques',
      icon: '✍️'
    },
    {
      title: 'Vocabulary Builder',
      type: 'practice',
      url: 'https://www.vocabulary.com/',
      description: 'Build your English vocabulary',
      icon: '💬'
    },
  ],
  'social-science': [
    {
      title: 'History - Magnet Brains',
      type: 'video',
      url: 'https://www.youtube.com/c/MagnetBrainsEducation',
      description: 'Detailed history lessons',
      icon: '🏛️'
    },
    {
      title: 'Geography Concepts',
      type: 'video',
      url: 'https://www.youtube.com/playlist?list=PLVLoWQFkZbhWi9v7Kwov5P1WMHilb0S_o',
      description: 'Map work and geographical concepts',
      icon: '🌍'
    },
    {
      title: 'Civics & Economics',
      type: 'website',
      url: 'https://www.toppr.com/guides/civics/',
      description: 'Political Science and Economics notes',
      icon: '⚖️'
    },
    {
      title: 'NCERT Social Science',
      type: 'pdf',
      url: 'https://ncert.nic.in/textbook.php',
      description: 'Official NCERT textbooks',
      icon: '📕'
    },
  ],
  telugu: [
    {
      title: 'Telugu Grammar - Vyakaranam',
      type: 'video',
      url: 'https://www.youtube.com/playlist?list=PLjNzuwSgXjJY7L3GvL8Z7HG0P_rSLKvrN',
      description: 'తెలుగు వ్యాకరణం - Complete Grammar lessons',
      icon: '🔤'
    },
    {
      title: 'AP SCERT Telugu Textbooks',
      type: 'pdf',
      url: 'https://scert.ap.gov.in/SCERTAP/index.html',
      description: 'Official AP Board Telugu textbooks and resources',
      icon: '📘'
    },
    {
      title: 'Telugu Literature & Poetry',
      type: 'website',
      url: 'https://www.pscnotes.com/telugu/',
      description: 'పద్యాలు, కవితలు మరియు సాహిత్యం',
      icon: '📜'
    },
    {
      title: 'Telugu Writing Skills',
      type: 'video',
      url: 'https://www.youtube.com/c/LearnTeluguThroughEnglish',
      description: 'వ్యాసం, లేఖ రచన మరియు అనువాదం',
      icon: '✍️'
    },
    {
      title: 'Telugu Bhasha - Online Learning',
      type: 'website',
      url: 'https://www.learncbse.in/cbse-class-10/',
      description: 'Comprehensive Telugu language learning',
      icon: '🌟'
    },
    {
      title: 'Telugu Practice Tests',
      type: 'practice',
      url: 'https://www.studiestoday.com/telugu-sample-papers-class-10',
      description: 'Sample papers and mock tests',
      icon: '📝'
    },
  ],
  computer: [
    {
      title: 'Programming Basics',
      type: 'video',
      url: 'https://www.youtube.com/c/CodeWithHarry',
      description: 'Learn Python and basic programming',
      icon: '💻'
    },
    {
      title: 'Computer Applications',
      type: 'website',
      url: 'https://www.w3schools.com/',
      description: 'HTML, CSS, and web basics',
      icon: '🌐'
    },
    {
      title: 'MS Office Tutorial',
      type: 'video',
      url: 'https://www.youtube.com/playlist?list=PLrRPvpgDmw0n34OMHeS94epMaX_Y8Tu1k',
      description: 'Word, Excel, PowerPoint tutorials',
      icon: '📊'
    },
    {
      title: 'Typing Practice',
      type: 'practice',
      url: 'https://www.typing.com/',
      description: 'Improve your typing speed',
      icon: '⌨️'
    },
  ],
}