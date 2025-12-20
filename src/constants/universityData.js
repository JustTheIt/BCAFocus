export const UNIVERSITIES = [
    {
        uniId: 'TU',
        name: 'Tribhuvan University',
        totalCredits: 126,
        breakdown: { core: 96, elective: 6, math: 6, language: 6, projects: 12 },
        semesters: [
            {
                id: 1,
                name: 'First Semester',
                subjects: [
                    { code: 'CACS101', name: 'Computer Fundamentals & Applications', credit: 4, description: 'Intro to computers', units: [] },
                    { code: 'CACS102', name: 'Society and Technology', credit: 3, description: 'Impact of tech on society', units: [] },
                    { code: 'CAEN103', name: 'English I', credit: 3, description: 'Communication skills', units: [] },
                    { code: 'CAMT104', name: 'Mathematics I', credit: 3, description: 'Calculus and Algebra', units: [] },
                    { code: 'CACS105', name: 'Digital Logic', credit: 3, description: 'Boolean algebra and circuits', units: [] },
                ]
            },
            {
                id: 2,
                name: 'Second Semester',
                subjects: [
                    { code: 'CACS151', name: 'C Programming', credit: 4, description: 'Programming in C', units: [] },
                    { code: 'CAEN152', name: 'English II', credit: 3, description: 'Technical writing', units: [] },
                    { code: 'CAMT153', name: 'Mathematics II', credit: 3, description: 'Statistics and Linear Algebra', units: [] },
                    { code: 'CACS154', name: 'Financial Accounting', credit: 3, description: 'Accounting basics', units: [] },
                    { code: 'CACS155', name: 'Microprocessor and Computer Architecture', credit: 3, description: 'CPU internal architecture', units: [] },
                ]
            }
            // Add other semesters as needed
        ]
    },
    {
        uniId: 'PU',
        name: 'Pokhara University',
        totalCredits: 120,
        breakdown: { core: 90, elective: 10, math: 10, language: 10, projects: 0 },
        semesters: []
    },
    {
        uniId: 'Purbanchal',
        name: 'Purbanchal University',
        totalCredits: 125,
        breakdown: { core: 95, elective: 5, math: 10, language: 5, projects: 10 },
        semesters: []
    }
];
