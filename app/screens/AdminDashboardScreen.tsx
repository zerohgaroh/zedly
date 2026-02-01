import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View,
} from 'react-native';
import { apiRequest } from '../api';
import AlertBox from '../components/AlertBox';
import AppTopBar from '../components/AppTopBar';
import HoverablePressable from '../components/HoverablePressable';
import { getThemeTokens } from '../theme';

type AdminDashboardScreenProps = {
  user: { firstName?: string; lastName?: string };
  language?: 'ru' | 'uz';
  initialSection?: AdminSection;
  token?: string | null;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
};

type AdminSection = 'home' | 'analytics' | 'classes' | 'subjects' | 'passwords' | 'teacherTests' | 'newUser';

type AdminRecord = Record<string, any>;

const translations = {
  ru: {
    dashboard: 'Админ Панель',
    welcome: 'Добро пожаловать',
    role: 'Администратор',
    adminManagement: 'Управление системой и контроль',
    analytics: 'Аналитика',
    analyticsDesc: 'Статистика и метрики системы',
    classes: 'Классы',
    classesManagement: 'Управление классами и группами',
    teacherTests: 'Тесты учителей',
    teacherTestsDesc: 'Тесты для оценки компетенций',
    subjectsManagement: 'Управление предметами',
    subjectsManagementDesc: 'Добавляйте и редактируйте школьные предметы',
    newUser: 'Новый пользователь',
    newUserDesc: 'Добавить ученика или учителя',
    passwords: 'Пароли',
    passwordsManagement: 'Управление паролями пользователей',
    student: 'Ученик',
    teacher: 'Учитель',
    admin: 'Администратор',
    students: 'Ученики',
    teachers: 'Учителя',
    classFilter: 'Фильтр по классу',
    allClasses: 'Все классы',
    noStudents: 'Учеников не найдено',
    noTeachers: 'Учителей не найдено',
    back: 'Назад',
    add: 'Добавить',
    edit: 'Редактировать',
    delete: 'Удалить',
    save: 'Сохранить',
    reset: 'Сбросить',
    totalUsers: 'Всего пользователей',
    totalClasses: 'Всего классов',
    totalTests: 'Всего тестов',
    completionRate: 'Процент выполнения',
    classesList: 'Список классов',
    subjectsList: 'Список предметов',
    teacherTestsList: 'Тесты учителей',
    passwordsList: 'Сброс паролей',
    newUserForm: 'Добавить пользователя',
    soon: 'Скоро будет доступно',
    loading: 'Загрузка...',
  },
  uz: {
    dashboard: 'Admin Panel',
    welcome: 'Xush kelibsiz',
    role: 'Administrator',
    adminManagement: 'Tizimni boshqarish va nazorat',
    analytics: 'Analitika',
    analyticsDesc: 'Statistika va tizim metrikalari',
    classes: 'Sinflar',
    classesManagement: 'Sinflar va guruhlarni boshqarish',
    teacherTests: "O'qituvchi testlari",
    teacherTestsDesc: 'Kompetensiyalarni baholash testlari',
    subjectsManagement: 'Fanlarni boshqarish',
    subjectsManagementDesc: 'Fanlarni qo‘shing va tahrirlang',
    newUser: 'Yangi foydalanuvchi',
    newUserDesc: "O‘quvchi yoki o‘qituvchi qo‘shish",
    passwords: 'Parollar',
    passwordsManagement: 'Foydalanuvchi parollarini boshqarish',
    student: "O'quvchi",
    teacher: "O'qituvchi",
    admin: 'Administrator',
    students: "O'quvchilar",
    teachers: "O'qituvchilar",
    classFilter: "Sinf bo‘yicha filtr",
    allClasses: 'Barcha sinflar',
    noStudents: "O'quvchilar topilmadi",
    noTeachers: "O'qituvchilar topilmadi",
    back: 'Orqaga',
    add: "Qo'shish",
    edit: 'Tahrirlash',
    delete: "O‘chirish",
    save: 'Saqlash',
    reset: 'Qayta tiklash',
    totalUsers: 'Jami foydalanuvchilar',
    totalClasses: 'Jami sinflar',
    totalTests: 'Jami testlar',
    completionRate: 'Bajarilish foizi',
    classesList: 'Sinflar roʻyxati',
    subjectsList: 'Fanlar roʻyxati',
    teacherTestsList: "O'qituvchi testlari",
    passwordsList: 'Parollarni tiklash',
    newUserForm: 'Foydalanuvchi qo‘shish',
    soon: 'Tez orada mavjud bo‘ladi',
    loading: 'Yuklanmoqda...',
  },
};


export default function AdminDashboardScreen({
  user,
  language = 'ru',
  initialSection = 'home',
  token,
  theme = 'dark',
  onToggleTheme,
}: AdminDashboardScreenProps) {
  const t = translations[language];
  const colors = getThemeTokens(theme);
  const textPrimary = { color: colors.textPrimary };
  const textSecondary = { color: colors.textSecondary };
  const textMuted = { color: colors.textMuted };
  const surfaceCard = { backgroundColor: colors.bgSecondary, borderColor: colors.border };
  const surfaceAlt = { backgroundColor: colors.bgTertiary, borderColor: colors.border };
  const inputStyle = { backgroundColor: colors.bgSecondary, borderColor: colors.border, color: colors.textPrimary };
  const [section, setSection] = useState<AdminSection>(initialSection);
  const [activeTab, setActiveTab] = useState<'students' | 'teachers'>('students');
  const [classFilter, setClassFilter] = useState('all');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [users, setUsers] = useState<AdminRecord[]>([]);
  const [classes, setClasses] = useState<AdminRecord[]>([]);
  const [tests, setTests] = useState<AdminRecord[]>([]);
  const [subjects, setSubjects] = useState<AdminRecord[]>([]);
  const [teacherTests, setTeacherTests] = useState<AdminRecord[]>([]);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [subjectNameRu, setSubjectNameRu] = useState('');
  const [subjectNameUz, setSubjectNameUz] = useState('');
  const [editingSubjectId, setEditingSubjectId] = useState<string | null>(null);
  const [passwordSearch, setPasswordSearch] = useState('');
  const [passwordRoleFilter, setPasswordRoleFilter] = useState('');
  const [passwordClassFilter, setPasswordClassFilter] = useState('');
  const [newUserRole, setNewUserRole] = useState<'student' | 'teacher'>('student');
  const messageVariant = useMemo(
    () => (/ошиб|xato|error/i.test(message) ? 'error' : 'success'),
    [message]
  );
  const [newUserFirstName, setNewUserFirstName] = useState('');
  const [newUserLastName, setNewUserLastName] = useState('');
  const [newUserUsername, setNewUserUsername] = useState('');
  const [newUserSchool, setNewUserSchool] = useState('');
  const [newUserGrade, setNewUserGrade] = useState('');
  const [newUserSection, setNewUserSection] = useState('');
  const [classGrade, setClassGrade] = useState('');
  const [className, setClassName] = useState('');
  const [classTeacherId, setClassTeacherId] = useState('');
  const apiRequestWithAuth = async (path: string, options: RequestInit = {}) => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> | undefined),
    };

    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    return apiRequest(path, {
      ...options,
      headers,
    });
  };
  useEffect(() => {
    setSection(initialSection);
  }, [initialSection]);

  const fallbackUsers = useMemo<AdminRecord[]>(
    () => [
      { id: 's1', role: 'student', firstName: 'Aziz', lastName: 'Karimov', username: 'student_aziz', grade: '9', gradeSection: 'A' },
      { id: 's2', role: 'student', firstName: 'Malika', lastName: 'Usmanova', username: 'student_malika', grade: '9', gradeSection: 'B' },
      { id: 't1', role: 'teacher', firstName: 'Nodir', lastName: 'Saidov', username: 'teacher_nodir' },
      { id: 't2', role: 'teacher', firstName: 'Zarina', lastName: 'Ismailova', username: 'teacher_zarina' },
    ],
    []
  );

  const fallbackClasses = useMemo<AdminRecord[]>(
    () => [
      { id: 'c1', grade: '9', name: 'A', studentCount: 26 },
      { id: 'c2', grade: '9', name: 'B', studentCount: 24 },
      { id: 'c3', grade: '10', name: 'A', studentCount: 28 },
    ],
    []
  );

  const fallbackSubjects = useMemo<AdminRecord[]>(
    () => [
      { id: 'sub1', nameRu: 'Математика', nameUz: 'Matematika' },
      { id: 'sub2', nameRu: 'Физика', nameUz: 'Fizika' },
      { id: 'sub3', nameRu: 'История', nameUz: 'Tarix' },
    ],
    []
  );

  const fallbackTeacherTests = useMemo<AdminRecord[]>(
    () => [
      { id: 'tt1', title: 'Алгебра • 9 класс', status: 'Опубликован' },
      { id: 'tt2', title: 'Физика • 10 класс', status: 'Черновик' },
    ],
    []
  );

  useEffect(() => {
    if (!token) {
      setUsers(fallbackUsers);
      setClasses(fallbackClasses);
      setSubjects(fallbackSubjects);
      setTeacherTests(fallbackTeacherTests);
      return;
    }

    const loadAdminData = async () => {
      setLoading(true);
      setError('');
      const [usersRes, classesRes, testsRes, subjectsRes, teacherTestsRes] = await Promise.all([
        apiRequestWithAuth('/api/users'),
        apiRequestWithAuth('/api/classes'),
        apiRequestWithAuth('/api/tests'),
        apiRequestWithAuth('/api/subjects'),
        apiRequestWithAuth('/api/teacher-tests'),
      ]);

      if (!usersRes.success || !classesRes.success || !testsRes.success) {
        setError(usersRes.error || classesRes.error || testsRes.error || 'Ошибка при загрузке данных');
      }

      if (usersRes.success) setUsers(usersRes.data?.data || usersRes.data || []);
      if (classesRes.success) setClasses(classesRes.data?.data || classesRes.data || []);
      if (testsRes.success) setTests(testsRes.data?.data || testsRes.data || []);
      if (subjectsRes.success) setSubjects(subjectsRes.data?.data || subjectsRes.data || []);
      if (teacherTestsRes.success) setTeacherTests(teacherTestsRes.data?.data || teacherTestsRes.data || []);

      setLoading(false);
    };

    loadAdminData();
  }, [fallbackClasses, fallbackSubjects, fallbackTeacherTests, fallbackUsers, token]);

  const students = useMemo<AdminRecord[]>(
    () => users.filter((u: AdminRecord) => u.role === 'student'),
    [users]
  );
  const teachers = useMemo<AdminRecord[]>(
    () => users.filter((u: AdminRecord) => u.role === 'teacher'),
    [users]
  );

  const getStudentClassLabel = (student: any) => {
    const grade = String(student.grade || '').trim();
    const section = String(student.gradeSection || '').trim();
    const label = `${grade}${section}`.trim();
    return label || '—';
  };

  const classOptions = useMemo<string[]>(() => {
    const unique = Array.from(
      new Set(students.map((s: AdminRecord) => getStudentClassLabel(s)).filter((v: string) => v !== '—'))
    ).sort();
    return ['all', ...unique];
  }, [students]);

  const filteredStudents = useMemo<AdminRecord[]>(() => {
    if (classFilter === 'all') return students;
    return students.filter((student: AdminRecord) => getStudentClassLabel(student) === classFilter);
  }, [classFilter, students]);

  const filteredPasswordUsers = useMemo<AdminRecord[]>(() => {
    const query = passwordSearch.trim().toLowerCase();
    return users.filter((u: AdminRecord) => {
      const name = `${u.name || ''} ${u.firstName || ''} ${u.lastName || ''}`.trim();
      const matchSearch = !query || `${name} ${u.username || ''}`.toLowerCase().includes(query);
      const matchRole = !passwordRoleFilter || u.role === passwordRoleFilter;
      const classLabel = getStudentClassLabel(u);
      const matchClass = !passwordClassFilter || classLabel === passwordClassFilter;
      return matchSearch && matchRole && matchClass;
    });
  }, [getStudentClassLabel, passwordClassFilter, passwordRoleFilter, passwordSearch, users]);

  const filteredSubjects = useMemo<AdminRecord[]>(() => {
    const query = subjectSearch.trim().toLowerCase();
    if (!query) return subjects;
    return subjects.filter((subject: AdminRecord) => {
      const ru = String(subject.nameRu || '').toLowerCase();
      const uz = String(subject.nameUz || '').toLowerCase();
      return ru.includes(query) || uz.includes(query);
    });
  }, [subjectSearch, subjects]);

  const resetSubjectForm = () => {
    setSubjectNameRu('');
    setSubjectNameUz('');
    setEditingSubjectId(null);
  };

  const resetClassForm = () => {
    setClassGrade('');
    setClassName('');
    setClassTeacherId('');
  };

  const handleCreateClass = async () => {
    if (!token) {
      setMessage(language === 'ru' ? 'Нет подключения к серверу' : 'Serverga ulanmagan');
      return;
    }

    setLoading(true);
    const payload: Record<string, any> = {
      grade: classGrade.trim(),
      name: className.trim(),
    };
    if (classTeacherId.trim()) {
      payload.teacherId = classTeacherId.trim();
    }

    const result = await apiRequestWithAuth('/api/classes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (result.success) {
      setMessage(language === 'ru' ? 'Класс добавлен' : "Sinf qo‘shildi");
      resetClassForm();
      const refresh = await apiRequestWithAuth('/api/classes');
      if (refresh.success) setClasses(refresh.data?.data || refresh.data || []);
    } else {
      setMessage(result.error || (language === 'ru' ? 'Ошибка создания' : 'Xatolik yuz berdi'));
    }
    setLoading(false);
  };

  const handleDeleteClass = (classItem: AdminRecord) => {
    if (!token) {
      setMessage(language === 'ru' ? 'Нет подключения к серверу' : 'Serverga ulanmagan');
      return;
    }

    const classId = classItem.id || classItem._id;
    const classLabel = classItem.name ? `${classItem.grade || ''}${classItem.name}` : `${classItem.grade || ''}`;

    Alert.alert(
      language === 'ru' ? 'Удалить класс?' : "Sinfni o‘chirish?",
      `${classLabel || ''}`.trim() || (language === 'ru' ? 'Это действие нельзя отменить' : 'Bu amalni qaytarib bo‘lmaydi'),
      [
        { text: language === 'ru' ? 'Отмена' : 'Bekor qilish', style: 'cancel' },
        {
          text: language === 'ru' ? 'Удалить' : "O‘chirish",
          style: 'destructive',
          onPress: async () => {
            const result = await apiRequestWithAuth(`/api/classes/${classId}`, { method: 'DELETE' });
            if (result.success) {
              setMessage(language === 'ru' ? 'Удалено' : "O‘chirildi");
              setClasses((prev: AdminRecord[]) => prev.filter(item => (item.id || item._id) !== classId));
            } else {
              setMessage(result.error || (language === 'ru' ? 'Ошибка удаления' : 'Xatolik yuz berdi'));
            }
          },
        },
      ]
    );
  };

  const handleSaveSubject = async () => {
    if (!subjectNameRu.trim() || !subjectNameUz.trim()) {
      setMessage(language === 'ru' ? 'Заполните все поля' : "Barcha maydonlarni to‘ldiring");
      return;
    }

    if (!token) {
      setMessage(language === 'ru' ? 'Нет подключения к серверу' : 'Serverga ulanmagan');
      return;
    }

    setLoading(true);
    const payload = { nameRu: subjectNameRu.trim(), nameUz: subjectNameUz.trim() };
    const path = editingSubjectId ? `/api/subjects/${editingSubjectId}` : '/api/subjects';
    const method = editingSubjectId ? 'PUT' : 'POST';
    const result = await apiRequestWithAuth(path, { method, body: JSON.stringify(payload) });
    if (result.success) {
      setMessage(language === 'ru' ? 'Сохранено' : 'Saqlandi');
      resetSubjectForm();
      const refresh = await apiRequestWithAuth('/api/subjects');
      if (refresh.success) setSubjects(refresh.data?.data || refresh.data || []);
    } else {
      setMessage(result.error || (language === 'ru' ? 'Ошибка сохранения' : 'Xatolik yuz berdi'));
    }
    setLoading(false);
  };

  const handleEditSubject = (subject: any) => {
    setEditingSubjectId(subject.id || subject._id);
    setSubjectNameRu(subject.nameRu || '');
    setSubjectNameUz(subject.nameUz || '');
  };

  const handleDeleteSubject = (subject: any) => {
    if (!token) {
      setMessage(language === 'ru' ? 'Нет подключения к серверу' : 'Serverga ulanmagan');
      return;
    }

    Alert.alert(
      language === 'ru' ? 'Удалить предмет?' : "Fanni o‘chirish?",
      language === 'ru' ? 'Это действие нельзя отменить' : 'Bu amalni qaytarib bo‘lmaydi',
      [
        { text: language === 'ru' ? 'Отмена' : 'Bekor qilish', style: 'cancel' },
        {
          text: language === 'ru' ? 'Удалить' : "O‘chirish",
          style: 'destructive',
          onPress: async () => {
            const id = subject.id || subject._id;
            const result = await apiRequestWithAuth(`/api/subjects/${id}`, { method: 'DELETE' });
            if (result.success) {
              setMessage(language === 'ru' ? 'Удалено' : "O‘chirildi");
              setSubjects((prev: AdminRecord[]) => prev.filter(item => (item.id || item._id) !== id));
            } else {
              setMessage(result.error || (language === 'ru' ? 'Ошибка удаления' : 'Xatolik yuz berdi'));
            }
          },
        },
      ]
    );
  };

  const handleResetPassword = async (userItem: any) => {
    if (!token) {
      setMessage(language === 'ru' ? 'Нет подключения к серверу' : 'Serverga ulanmagan');
      return;
    }
    const id = userItem.id || userItem._id;
    const result = await apiRequestWithAuth(`/api/users/${id}/reset-password`, { method: 'POST' });
    if (result.success) {
      Alert.alert(
        language === 'ru' ? 'Пароль сброшен' : 'Parol tiklandi',
        `${language === 'ru' ? 'OTP' : 'OTP'}: ${result.data?.otp || '—'}`
      );
    } else {
      setMessage(result.error || (language === 'ru' ? 'Ошибка сброса' : 'Xatolik yuz berdi'));
    }
  };

  const handleCreateUser = async () => {
    if (!newUserFirstName.trim() || !newUserLastName.trim() || !newUserUsername.trim()) {
      setMessage(language === 'ru' ? 'Заполните обязательные поля' : "Majburiy maydonlarni to‘ldiring");
      return;
    }
    if (!token) {
      setMessage(language === 'ru' ? 'Нет подключения к серверу' : 'Serverga ulanmagan');
      return;
    }

    setLoading(true);
    const payload: any = {
      role: newUserRole,
      firstName: newUserFirstName.trim(),
      lastName: newUserLastName.trim(),
      username: newUserUsername.trim(),
      school: newUserSchool.trim(),
    };

    if (newUserRole === 'student') {
      payload.grade = newUserGrade.trim() || '9';
      payload.gradeSection = newUserSection.trim() || 'A';
    }

    const result = await apiRequestWithAuth('/api/users/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (result.success) {
      Alert.alert(
        language === 'ru' ? 'Пользователь создан' : 'Foydalanuvchi yaratildi',
        `${language === 'ru' ? 'OTP' : 'OTP'}: ${result.data?.otp || '—'}`
      );
      setNewUserFirstName('');
      setNewUserLastName('');
      setNewUserUsername('');
      setNewUserSchool('');
      setNewUserGrade('');
      setNewUserSection('');
      const refresh = await apiRequestWithAuth('/api/users');
      if (refresh.success) setUsers(refresh.data?.data || refresh.data || []);
    } else {
      setMessage(result.error || (language === 'ru' ? 'Ошибка создания' : 'Xatolik yuz berdi'));
    }
    setLoading(false);
  };

  const actionCards = [
    {
      key: 'analytics',
      title: t.analytics,
      description: t.analyticsDesc,
      color: '#3B82F6',
      icon: '📊',
      gradient: ['rgba(59, 130, 246, 0.08)', 'rgba(59, 130, 246, 0.02)'],
      section: 'analytics' as AdminSection,
    },
    {
      key: 'classes',
      title: t.classes,
      description: t.classesManagement,
      color: '#10B981',
      icon: '🏫',
      gradient: ['rgba(16, 185, 129, 0.08)', 'rgba(16, 185, 129, 0.02)'],
      section: 'classes' as AdminSection,
    },
    {
      key: 'teacherTests',
      title: t.teacherTests,
      description: t.teacherTestsDesc,
      color: '#F59E0B',
      icon: '📋',
      gradient: ['rgba(245, 158, 11, 0.08)', 'rgba(245, 158, 11, 0.02)'],
      section: 'teacherTests' as AdminSection,
    },
    {
      key: 'subjects',
      title: t.subjectsManagement,
      description: t.subjectsManagementDesc,
      color: '#7C3AED',
      icon: '📚',
      gradient: ['rgba(124, 58, 237, 0.08)', 'rgba(124, 58, 237, 0.02)'],
      section: 'subjects' as AdminSection,
    },
    {
      key: 'newUser',
      title: t.newUser,
      description: t.newUserDesc,
      color: '#22C55E',
      icon: '➕',
      gradient: ['rgba(34, 197, 94, 0.08)', 'rgba(34, 197, 94, 0.02)'],
      section: 'newUser' as AdminSection,
    },
    {
      key: 'passwords',
      title: t.passwords,
      description: t.passwordsManagement,
      color: '#EF4444',
      icon: '🔐',
      gradient: ['rgba(239, 68, 68, 0.08)', 'rgba(239, 68, 68, 0.02)'],
      section: 'passwords' as AdminSection,
    },
  ];

  return (
    <View style={[styles.safeArea, { backgroundColor: colors.bgPrimary }]}>
      <StatusBar hidden />
      <ScrollView contentContainerStyle={styles.container}>
        <AppTopBar theme={theme} onToggleTheme={onToggleTheme} />
        <View style={styles.header}>
          <View style={styles.headerRow}>
            {section !== 'home' && (
              <HoverablePressable
                style={styles.backButton}
                hoverStyle={styles.backButtonHover}
                pressedStyle={styles.backButtonPressed}
                hoverScale={1}
                hoverTranslateY={0}
                onPress={() => setSection('home')}
              >
                {({ hovered, pressed }) => (
                  <Text style={[styles.backButtonText, (hovered || pressed) && styles.backButtonTextHover]}>
                    ← {t.back}
                  </Text>
                )}
              </HoverablePressable>
            )}
          </View>
          <Text style={[styles.title, textPrimary]}>{t.dashboard}</Text>
          <Text style={[styles.subtitle, textSecondary]}>{t.adminManagement}</Text>
          <Text style={[styles.welcome, textSecondary]}>
            {t.welcome}, {user.firstName || ''} {user.lastName || ''}
          </Text>
        </View>

        {loading && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color="#3B82F6" />
            <Text style={styles.loadingText}>{t.loading || 'Загрузка...'}</Text>
          </View>
        )}

        {error ? (
          <AlertBox
            variant="error"
            message={error}
            theme={theme}
            onClose={() => setError('')}
          />
        ) : null}

        {section === 'home' && (
          <>
            <View style={styles.actionsGrid}>
              {actionCards.map(card => (
                <HoverablePressable
                  key={card.key}
                  style={[styles.actionCard, { borderColor: card.color }]}
                  hoverStyle={styles.actionCardHover}
                  pressedStyle={styles.actionCardPressed}
                  hoverScale={1.02}
                  hoverTranslateY={-6}
                  onPress={() => {
                    setMessage('');
                    setSection(card.section);
                  }}
                >
                  {() => (
                    <>
                      <LinearGradient
                        colors={(theme === 'light' ? [colors.bgSecondary, colors.bgTertiary] : card.gradient) as [string, string]}
                        style={styles.actionCardBackground}
                      />
                      <View style={styles.actionRow}>
                        <View style={[styles.actionIcon, { backgroundColor: card.color }]}> 
                          <Text style={styles.actionIconText}>{card.icon}</Text>
                        </View>
                        <View style={styles.actionContent}>
                          <Text style={[styles.actionTitle, textPrimary]}>{card.title}</Text>
                          <Text style={[styles.actionDesc, textSecondary]}>{card.description}</Text>
                        </View>
                        <Text style={[styles.actionArrow, { color: card.color }]}>→</Text>
                      </View>
                    </>
                  )}
                </HoverablePressable>
              ))}
            </View>

            <View style={[styles.tabsCard, surfaceCard]}>
              <View style={styles.tabsHeader}>
                <HoverablePressable
                  style={[styles.tabButton, activeTab === 'students' && styles.tabButtonActive]}
                  hoverStyle={styles.tabButtonHover}
                  pressedStyle={styles.tabButtonPressed}
                  hoverScale={1}
                  hoverTranslateY={0}
                  onPress={() => setActiveTab('students')}
                >
                  {({ hovered, pressed }) => (
                    <Text
                      style={[
                        styles.tabText,
                        textSecondary,
                        activeTab === 'students' && styles.tabTextActive,
                        activeTab === 'students' && { color: colors.accent },
                        (hovered || pressed) && styles.tabTextHover,
                        (hovered || pressed) && { color: colors.accent },
                      ]}
                    >
                      {t.students}
                    </Text>
                  )}
                </HoverablePressable>
                <HoverablePressable
                  style={[styles.tabButton, activeTab === 'teachers' && styles.tabButtonActive]}
                  hoverStyle={styles.tabButtonHover}
                  pressedStyle={styles.tabButtonPressed}
                  hoverScale={1}
                  hoverTranslateY={0}
                  onPress={() => setActiveTab('teachers')}
                >
                  {({ hovered, pressed }) => (
                    <Text
                      style={[
                        styles.tabText,
                        textSecondary,
                        activeTab === 'teachers' && styles.tabTextActive,
                        activeTab === 'teachers' && { color: colors.accent },
                        (hovered || pressed) && styles.tabTextHover,
                        (hovered || pressed) && { color: colors.accent },
                      ]}
                    >
                      {t.teachers}
                    </Text>
                  )}
                </HoverablePressable>
              </View>

              {activeTab === 'students' && (
                <View style={styles.tabContent}>
                  <Text style={[styles.filterLabel, textSecondary]}>{t.classFilter}</Text>
                  <View style={styles.filterChips}>
                    {classOptions.map((option: string) => (
                      <HoverablePressable
                        key={option}
                        style={[styles.filterChip, classFilter === option && styles.filterChipActive]}
                        hoverStyle={styles.filterChipHover}
                        pressedStyle={styles.filterChipPressed}
                        hoverScale={1}
                        hoverTranslateY={0}
                        onPress={() => setClassFilter(option)}
                      >
                        {({ hovered, pressed }) => (
                          <Text
                            style={[
                              styles.filterChipText,
                              textSecondary,
                              classFilter === option && styles.filterChipTextActive,
                              classFilter === option && { color: colors.accent },
                              (hovered || pressed) && styles.filterChipTextHover,
                              (hovered || pressed) && { color: colors.accent },
                            ]}
                          >
                            {option === 'all' ? t.allClasses : option}
                          </Text>
                        )}
                      </HoverablePressable>
                    ))}
                  </View>

                  {filteredStudents.length === 0 ? (
                    <Text style={[styles.emptyText, textMuted]}>{t.noStudents}</Text>
                  ) : (
                    filteredStudents.map((student: AdminRecord) => {
                      const studentId = student.id || student._id;
                      const studentName = student.name || `${student.firstName || ''} ${student.lastName || ''}`.trim();
                      const classLabel = getStudentClassLabel(student);
                      return (
                        <View key={studentId} style={[styles.userRow, surfaceAlt]}>
                          <View>
                            <Text style={[styles.userName, textPrimary]}>{studentName || '—'}</Text>
                            <Text style={[styles.userMeta, textMuted]}>@{student.username || '—'}</Text>
                          </View>
                          <Text style={styles.badge}>{classLabel}</Text>
                        </View>
                      );
                    })
                  )}
                </View>
              )}

              {activeTab === 'teachers' && (
                <View style={styles.tabContent}>
                  {teachers.length === 0 ? (
                    <Text style={[styles.emptyText, textMuted]}>{t.noTeachers}</Text>
                  ) : (
                    teachers.map((teacher: AdminRecord) => {
                      const teacherId = teacher.id || teacher._id;
                      const teacherName = teacher.name || `${teacher.firstName || ''} ${teacher.lastName || ''}`.trim();
                      return (
                        <View key={teacherId} style={[styles.userRow, surfaceAlt]}>
                          <View>
                            <Text style={[styles.userName, textPrimary]}>{teacherName || '—'}</Text>
                            <Text style={[styles.userMeta, textMuted]}>@{teacher.username || '—'}</Text>
                          </View>
                          <Text style={styles.badge}>{t.teacher}</Text>
                        </View>
                      );
                    })
                  )}
                </View>
              )}
            </View>
          </>
        )}

        {section === 'analytics' && (
          <View style={[styles.sectionCard, surfaceCard]}>
            <Text style={[styles.sectionTitle, textPrimary]}>{t.analytics}</Text>
            <View style={styles.statsGrid}>
              <View style={[styles.statCard, surfaceAlt]}>
                <Text style={[styles.statLabel, textMuted]}>{t.totalUsers}</Text>
                <Text style={[styles.statValue, textPrimary]}>{users.length}</Text>
              </View>
              <View style={[styles.statCard, surfaceAlt]}>
                <Text style={[styles.statLabel, textMuted]}>{t.totalClasses}</Text>
                <Text style={[styles.statValue, textPrimary]}>{classes.length}</Text>
              </View>
              <View style={[styles.statCard, surfaceAlt]}>
                <Text style={[styles.statLabel, textMuted]}>{t.totalTests}</Text>
                <Text style={[styles.statValue, textPrimary]}>{tests.length}</Text>
              </View>
              <View style={[styles.statCard, surfaceAlt]}>
                <Text style={[styles.statLabel, textMuted]}>{t.completionRate}</Text>
                <Text style={[styles.statValue, textPrimary]}>—</Text>
              </View>
            </View>
          </View>
        )}

        {section === 'classes' && (
          <View style={[styles.sectionCard, surfaceCard]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, textPrimary]}>{t.classesList}</Text>
              <HoverablePressable
                style={styles.primaryButton}
                hoverStyle={styles.primaryButtonHover}
                pressedStyle={styles.primaryButtonPressed}
                hoverScale={1}
                hoverTranslateY={-2}
                onPress={handleCreateClass}
              >
                {() => <Text style={styles.primaryButtonText}>{t.add}</Text>}
              </HoverablePressable>
            </View>
            <View style={styles.formRow}>
              <TextInput
                value={classGrade}
                onChangeText={setClassGrade}
                placeholder={language === 'ru' ? 'Номер класса' : 'Sinf raqami'}
                placeholderTextColor={colors.textMuted}
                style={[styles.input, inputStyle]}
              />
              <TextInput
                value={className}
                onChangeText={setClassName}
                placeholder={language === 'ru' ? 'Секция (A, B...)' : 'Bo‘lim (A, B...)'}
                placeholderTextColor={colors.textMuted}
                style={[styles.input, inputStyle]}
              />
            </View>
            <TextInput
              value={classTeacherId}
              onChangeText={setClassTeacherId}
              placeholder={language === 'ru' ? 'ID учителя (необязательно)' : 'O‘qituvchi ID (ixtiyoriy)'}
              placeholderTextColor={colors.textMuted}
              style={[styles.input, inputStyle]}
            />
            {classes.map((item: AdminRecord) => {
              const classId = item.id || item._id;
              const classLabel = item.name
                ? `${item.grade || ''}${item.name}`
                : (item.sections?.length ? `${item.grade || ''} (${item.sections.join(', ')})` : (item.grade || '—'));
              return (
                <View key={classId} style={[styles.listRow, surfaceAlt]}>
                  <View>
                    <Text style={[styles.listTitle, textPrimary]}>{classLabel}</Text>
                    <Text style={[styles.listMeta, textMuted]}>{item.studentCount || 0} students</Text>
                  </View>
                  <View style={styles.listActions}>
                    <HoverablePressable
                      style={styles.dangerButton}
                      hoverStyle={styles.dangerButtonHover}
                      pressedStyle={styles.dangerButtonPressed}
                      hoverScale={1}
                      hoverTranslateY={-1}
                      onPress={() => handleDeleteClass(item)}
                    >
                      {({ hovered, pressed }) => (
                        <Text
                          style={[
                            styles.dangerButtonText,
                            (hovered || pressed) && styles.dangerButtonTextHover,
                          ]}
                        >
                          {t.delete}
                        </Text>
                      )}
                    </HoverablePressable>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {section === 'subjects' && (
          <View style={[styles.sectionCard, surfaceCard]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, textPrimary]}>{t.subjectsList}</Text>
              <HoverablePressable
                style={styles.primaryButton}
                hoverStyle={styles.primaryButtonHover}
                pressedStyle={styles.primaryButtonPressed}
                hoverScale={1}
                hoverTranslateY={-2}
                onPress={handleSaveSubject}
              >
                {() => (
                  <Text style={styles.primaryButtonText}>
                    {editingSubjectId ? t.save : t.add}
                  </Text>
                )}
              </HoverablePressable>
            </View>
            <View style={styles.formRow}>
              <TextInput
                value={subjectNameRu}
                onChangeText={setSubjectNameRu}
                placeholder={language === 'ru' ? 'Название (RU)' : 'Nomi (RU)'}
                placeholderTextColor={colors.textMuted}
                style={[styles.input, inputStyle]}
              />
              <TextInput
                value={subjectNameUz}
                onChangeText={setSubjectNameUz}
                placeholder={language === 'ru' ? 'Название (UZ)' : 'Nomi (UZ)'}
                placeholderTextColor={colors.textMuted}
                style={[styles.input, inputStyle]}
              />
            </View>
            <TextInput
              value={subjectSearch}
              onChangeText={setSubjectSearch}
              placeholder={language === 'ru' ? 'Найти предмет...' : 'Fan qidirish...'}
              placeholderTextColor={colors.textMuted}
              style={[styles.input, inputStyle]}
            />
            {filteredSubjects.map((subject: AdminRecord) => (
              <View key={subject.id || subject._id} style={[styles.listRow, surfaceAlt]}>
                <View>
                  <Text style={[styles.listTitle, textPrimary]}>{language === 'ru' ? subject.nameRu : subject.nameUz}</Text>
                  <Text style={[styles.listMeta, textMuted]}>{language === 'ru' ? subject.nameUz : subject.nameRu}</Text>
                </View>
                <View style={styles.listActions}>
                  <HoverablePressable
                    style={styles.secondaryButton}
                    hoverStyle={styles.secondaryButtonHover}
                    pressedStyle={styles.secondaryButtonPressed}
                    hoverScale={1}
                    hoverTranslateY={-1}
                    onPress={() => handleEditSubject(subject)}
                  >
                    {({ hovered, pressed }) => (
                      <Text
                        style={[
                          styles.secondaryButtonText,
                          (hovered || pressed) && styles.secondaryButtonTextHover,
                        ]}
                      >
                        {t.edit}
                      </Text>
                    )}
                  </HoverablePressable>
                  <HoverablePressable
                    style={styles.dangerButton}
                    hoverStyle={styles.dangerButtonHover}
                    pressedStyle={styles.dangerButtonPressed}
                    hoverScale={1}
                    hoverTranslateY={-1}
                    onPress={() => handleDeleteSubject(subject)}
                  >
                    {({ hovered, pressed }) => (
                      <Text
                        style={[
                          styles.dangerButtonText,
                          (hovered || pressed) && styles.dangerButtonTextHover,
                        ]}
                      >
                        {t.delete}
                      </Text>
                    )}
                  </HoverablePressable>
                </View>
              </View>
            ))}
          </View>
        )}

        {section === 'teacherTests' && (
          <View style={[styles.sectionCard, surfaceCard]}>
            <Text style={[styles.sectionTitle, textPrimary]}>{t.teacherTestsList}</Text>
            {teacherTests.map((test: AdminRecord) => (
              <View key={test.id || test._id} style={[styles.listRow, surfaceAlt]}>
                <Text style={[styles.listTitle, textPrimary]}>{test.title || test.name || '—'}</Text>
                <Text style={[styles.listMeta, textMuted]}>{test.status || test.state || '—'}</Text>
              </View>
            ))}
          </View>
        )}

        {section === 'passwords' && (
          <View style={[styles.sectionCard, surfaceCard]}>
            <Text style={[styles.sectionTitle, textPrimary]}>{t.passwordsList}</Text>
            <TextInput
              value={passwordSearch}
              onChangeText={setPasswordSearch}
              placeholder={language === 'ru' ? 'Найти пользователя...' : 'Foydalanuvchini qidiring...'}
              placeholderTextColor={colors.textMuted}
              style={[styles.input, inputStyle]}
            />
            <View style={styles.filterChips}>
              {['', 'student', 'teacher', 'admin'].map((roleKey: string) => (
                <HoverablePressable
                  key={roleKey || 'all'}
                  style={[styles.filterChip, passwordRoleFilter === roleKey && styles.filterChipActive]}
                  hoverStyle={styles.filterChipHover}
                  pressedStyle={styles.filterChipPressed}
                  hoverScale={1}
                  hoverTranslateY={0}
                  onPress={() => setPasswordRoleFilter(roleKey)}
                >
                  {({ hovered, pressed }) => (
                    <Text
                      style={[
                        styles.filterChipText,
                        textSecondary,
                        passwordRoleFilter === roleKey && styles.filterChipTextActive,
                        passwordRoleFilter === roleKey && { color: colors.accent },
                        (hovered || pressed) && styles.filterChipTextHover,
                        (hovered || pressed) && { color: colors.accent },
                      ]}
                    >
                      {roleKey
                        ? roleKey === 'student'
                          ? t.student
                          : roleKey === 'teacher'
                            ? t.teacher
                            : t.admin
                        : language === 'ru'
                          ? 'Все роли'
                          : 'Barcha rollar'}
                    </Text>
                  )}
                </HoverablePressable>
              ))}
            </View>
            <View style={styles.filterChips}>
              {classOptions.map((option: string) => (
                <HoverablePressable
                  key={option}
                  style={[styles.filterChip, passwordClassFilter === option && styles.filterChipActive]}
                  hoverStyle={styles.filterChipHover}
                  pressedStyle={styles.filterChipPressed}
                  hoverScale={1}
                  hoverTranslateY={0}
                  onPress={() => setPasswordClassFilter(option)}
                >
                  {({ hovered, pressed }) => (
                    <Text
                      style={[
                        styles.filterChipText,
                        textSecondary,
                        passwordClassFilter === option && styles.filterChipTextActive,
                        passwordClassFilter === option && { color: colors.accent },
                        (hovered || pressed) && styles.filterChipTextHover,
                        (hovered || pressed) && { color: colors.accent },
                      ]}
                    >
                      {option === 'all' ? t.allClasses : option}
                    </Text>
                  )}
                </HoverablePressable>
              ))}
            </View>
            {filteredPasswordUsers.map((item: AdminRecord) => {
              const name = item.name || `${item.firstName || ''} ${item.lastName || ''}`.trim();
              const userId = item.id || item._id;
              return (
                <View key={userId} style={[styles.listRow, surfaceAlt]}>
                  <View>
                    <Text style={[styles.listTitle, textPrimary]}>{name || '—'}</Text>
                    <Text style={[styles.listMeta, textMuted]}>@{item.username || '—'}</Text>
                  </View>
                  <HoverablePressable
                    style={styles.secondaryButton}
                    hoverStyle={styles.secondaryButtonHover}
                    pressedStyle={styles.secondaryButtonPressed}
                    hoverScale={1}
                    hoverTranslateY={-1}
                    onPress={() => handleResetPassword(item)}
                  >
                    {({ hovered, pressed }) => (
                      <Text
                        style={[
                          styles.secondaryButtonText,
                          (hovered || pressed) && styles.secondaryButtonTextHover,
                        ]}
                      >
                        {t.reset}
                      </Text>
                    )}
                  </HoverablePressable>
                </View>
              );
            })}
          </View>
        )}

        {section === 'newUser' && (
          <View style={[styles.sectionCard, surfaceCard]}>
            <Text style={[styles.sectionTitle, textPrimary]}>{t.newUserForm}</Text>
            <View style={styles.filterChips}>
              {(['student', 'teacher'] as const).map((roleKey: 'student' | 'teacher') => (
                <HoverablePressable
                  key={roleKey}
                  style={[styles.filterChip, newUserRole === roleKey && styles.filterChipActive]}
                  hoverStyle={styles.filterChipHover}
                  pressedStyle={styles.filterChipPressed}
                  hoverScale={1}
                  hoverTranslateY={0}
                  onPress={() => setNewUserRole(roleKey)}
                >
                  {({ hovered, pressed }) => (
                    <Text
                      style={[
                        styles.filterChipText,
                        textSecondary,
                        newUserRole === roleKey && styles.filterChipTextActive,
                        newUserRole === roleKey && { color: colors.accent },
                        (hovered || pressed) && styles.filterChipTextHover,
                        (hovered || pressed) && { color: colors.accent },
                      ]}
                    >
                      {roleKey === 'student' ? t.student : t.teacher}
                    </Text>
                  )}
                </HoverablePressable>
              ))}
            </View>
            <View style={styles.formRow}>
              <TextInput
                value={newUserFirstName}
                onChangeText={setNewUserFirstName}
                placeholder={language === 'ru' ? 'Имя' : 'Ism'}
                placeholderTextColor={colors.textMuted}
                style={[styles.input, inputStyle]}
              />
              <TextInput
                value={newUserLastName}
                onChangeText={setNewUserLastName}
                placeholder={language === 'ru' ? 'Фамилия' : 'Familiya'}
                placeholderTextColor={colors.textMuted}
                style={[styles.input, inputStyle]}
              />
            </View>
            <TextInput
              value={newUserUsername}
              onChangeText={setNewUserUsername}
              placeholder={language === 'ru' ? 'Имя пользователя' : 'Username'}
              placeholderTextColor={colors.textMuted}
              autoCapitalize="none"
              style={[styles.input, inputStyle]}
            />
            <TextInput
              value={newUserSchool}
              onChangeText={setNewUserSchool}
              placeholder={language === 'ru' ? 'Школа' : 'Maktab'}
              placeholderTextColor={colors.textMuted}
              style={[styles.input, inputStyle]}
            />
            {newUserRole === 'student' && (
              <View style={styles.formRow}>
                <TextInput
                  value={newUserGrade}
                  onChangeText={setNewUserGrade}
                  placeholder={language === 'ru' ? 'Класс (например 9)' : 'Sinf (9)'}
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, inputStyle]}
                />
                <TextInput
                  value={newUserSection}
                  onChangeText={setNewUserSection}
                  placeholder={language === 'ru' ? 'Секция (А)' : 'Bo‘lim (A)'}
                  placeholderTextColor={colors.textMuted}
                  style={[styles.input, inputStyle]}
                />
              </View>
            )}
            <HoverablePressable
              style={styles.primaryButton}
              hoverStyle={styles.primaryButtonHover}
              pressedStyle={styles.primaryButtonPressed}
              hoverScale={1}
              hoverTranslateY={-2}
              onPress={handleCreateUser}
            >
              {() => <Text style={styles.primaryButtonText}>{t.add}</Text>}
            </HoverablePressable>
          </View>
        )}

        {message ? (
          <AlertBox
            variant={messageVariant}
            message={message}
            theme={theme}
            onClose={() => setMessage('')}
          />
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0A0E1A',
  },
  container: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 32,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 40,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  loadingText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  errorText: {
    color: '#F87171',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: '#EF4444',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
  },
  headerRow: {
    minHeight: 28,
    marginBottom: 6,
  },
  backButton: {
    alignSelf: 'flex-start',
  },
  backButtonHover: {
    transform: [{ translateX: -4 }],
  },
  backButtonPressed: {
    opacity: 0.85,
  },
  backButtonText: {
    color: '#9CA3AF',
    fontWeight: '600',
  },
  backButtonTextHover: {
    color: '#BFDBFE',
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: '#F9FAFB',
  },
  subtitle: {
    marginTop: 8,
    color: '#D1D5DB',
    fontSize: 15,
  },
  welcome: {
    marginTop: 8,
    color: '#D1D5DB',
  },
  actionsGrid: {
    gap: 24,
    marginBottom: 40,
  },
  actionCard: {
    padding: 28,
    borderRadius: 16,
    borderWidth: 2,
    backgroundColor: 'transparent',
    overflow: 'hidden',
  },
  actionCardBackground: {
    ...StyleSheet.absoluteFillObject,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 16,
    alignItems: 'flex-start',
  },
  actionCardHover: {
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.2,
    shadowRadius: 32,
  },
  actionCardPressed: {
    opacity: 0.9,
  },
  actionIcon: {
    width: 56,
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  actionIconText: {
    fontSize: 24,
  },
  actionContent: {
    flex: 1,
  },
  actionTitle: {
    color: '#F9FAFB',
    fontWeight: '700',
    marginBottom: 6,
    fontSize: 18,
  },
  actionDesc: {
    color: '#D1D5DB',
    fontSize: 14,
    lineHeight: 20,
  },
  actionArrow: {
    fontSize: 24,
    fontWeight: '600',
  },
  tabsCard: {
    backgroundColor: '#151B2D',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#374151',
    overflow: 'hidden',
  },
  tabsHeader: {
    flexDirection: 'row',
    backgroundColor: '#1F2937',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 14,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabButtonHover: {
    backgroundColor: '#111827',
  },
  tabButtonPressed: {
    opacity: 0.9,
  },
  tabButtonActive: {
    borderBottomColor: '#3B82F6',
  },
  tabText: {
    color: '#9CA3AF',
    fontWeight: '600',
    fontSize: 14,
  },
  tabTextActive: {
    color: '#F9FAFB',
  },
  tabTextHover: {
    color: '#3B82F6',
  },
  tabContent: {
    padding: 16,
    gap: 12,
  },
  filterLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  filterChip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: '#374151',
    backgroundColor: '#0A0E1A',
  },
  filterChipHover: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.12)',
  },
  filterChipPressed: {
    opacity: 0.9,
  },
  filterChipActive: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
  },
  filterChipText: {
    color: '#9CA3AF',
    fontSize: 13,
  },
  filterChipTextHover: {
    color: '#BFDBFE',
    fontWeight: '600',
  },
  filterChipTextActive: {
    color: '#BFDBFE',
    fontWeight: '600',
  },
  userRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#374151',
  },
  userName: {
    color: '#F9FAFB',
    fontWeight: '600',
  },
  userMeta: {
    color: '#9CA3AF',
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    color: '#BFDBFE',
    fontSize: 12,
    fontWeight: '700',
  },
  emptyText: {
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 16,
  },
  sectionCard: {
    backgroundColor: '#151B2D',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 16,
    gap: 12,
  },
  sectionTitle: {
    color: '#F9FAFB',
    fontSize: 16,
    fontWeight: '700',
  },
  statsGrid: {
    gap: 12,
  },
  statCard: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1F2937',
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    marginBottom: 6,
  },
  statValue: {
    color: '#F9FAFB',
    fontSize: 20,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#374151',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#F9FAFB',
    backgroundColor: '#0A0E1A',
    marginBottom: 10,
  },
  primaryButton: {
    backgroundColor: '#2b59c3',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
  },
  primaryButtonHover: {
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 16,
  },
  primaryButtonPressed: {
    opacity: 0.9,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: '#374151',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  secondaryButtonHover: {
    borderColor: '#3B82F6',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
  },
  secondaryButtonPressed: {
    opacity: 0.9,
  },
  secondaryButtonText: {
    color: '#D1D5DB',
    fontWeight: '600',
    fontSize: 13,
  },
  secondaryButtonTextHover: {
    color: '#BFDBFE',
  },
  dangerButton: {
    borderWidth: 1,
    borderColor: '#EF4444',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  dangerButtonText: {
    color: '#F87171',
    fontWeight: '600',
    fontSize: 13,
  },
  dangerButtonHover: {
    borderColor: '#F87171',
  },
  dangerButtonPressed: {
    opacity: 0.9,
  },
  dangerButtonTextHover: {
    color: '#FCA5A5',
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1F2937',
  },
  listActions: {
    flexDirection: 'row',
    gap: 8,
  },
  listTitle: {
    color: '#F9FAFB',
    fontWeight: '600',
  },
  listMeta: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  messageText: {
    color: '#F59E0B',
    textAlign: 'center',
    marginTop: 8,
  },
});
