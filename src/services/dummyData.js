export const DUMMY_TOKEN = 'dummy-frontend-token'

export const DUMMY_CREDENTIALS = {
    email: 'admin@example.com',
    password: 'password',
}

const DUMMY_USER_KEY = 'dummy_user'
const DUMMY_TASKS_KEY = 'dummy_tasks'

const defaultDummyUser = {
    id: 1,
    name: 'Admin Leva',
    email: DUMMY_CREDENTIALS.email,
    is_onboarded: false,
    major: '',
    semester: '',
    learning_style: '',
}

export const isDummyToken = (token) => token === DUMMY_TOKEN

export const isDummyLogin = (email, password) => (
    email === DUMMY_CREDENTIALS.email && password === DUMMY_CREDENTIALS.password
)

export const getDummyUser = () => {
    const savedUser = localStorage.getItem(DUMMY_USER_KEY)

    if (!savedUser) {
        return { ...defaultDummyUser }
    }

    try {
        return { ...defaultDummyUser, ...JSON.parse(savedUser) }
    } catch {
        return { ...defaultDummyUser }
    }
}

export const saveDummyUser = (user) => {
    localStorage.setItem(DUMMY_USER_KEY, JSON.stringify(user))
}

export const clearDummyData = () => {
    localStorage.removeItem(DUMMY_USER_KEY)
}

export const getDummyTasks = () => {
    const savedTasks = localStorage.getItem(DUMMY_TASKS_KEY)

    if (!savedTasks) {
        return []
    }

    try {
        return JSON.parse(savedTasks)
    } catch {
        return []
    }
}

export const saveDummyTasks = (tasks) => {
    localStorage.setItem(DUMMY_TASKS_KEY, JSON.stringify(tasks))
}

export const createDummyTasksFromFile = (fileName) => [
    {
        title: `Review materi dari ${fileName}`,
    },
    {
        title: 'Buat ringkasan topik utama silabus',
    },
    {
        title: 'Susun jadwal belajar mingguan',
    },
]
