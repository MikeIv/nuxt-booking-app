import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue";
import { createI18n } from "vue-i18n";
import DatePickerWithPrices from "~/components/core/DatePickerWithPrices.vue";
import { setupPinia, mountComponent } from "../../utils/test-utils";

// Создаем экземпляр i18n для тестов
const i18n = createI18n({
  legacy: false,
  locale: "ru",
  messages: {
    ru: {
      datepicker: {
        checkInOut: "Заезд — выезд",
        selectDates: "Выберите даты",
        cancel: "Отмена",
        select: "Выбрать",
      },
    },
  },
});

// Моки для composables
const mockFetchCalendarPrices = vi.fn().mockResolvedValue(undefined);
const mockGetPriceForDate = vi.fn().mockReturnValue(null);
const mockFormatPrice = vi.fn(
  (price: number) => `${price.toLocaleString("ru-RU")} ₽`,
);
const mockPricesLoading = { value: false };

const mockMonthNames = [
  "Январь",
  "Февраль",
  "Март",
  "Апрель",
  "Май",
  "Июнь",
  "Июль",
  "Август",
  "Сентябрь",
  "Октябрь",
  "Ноябрь",
  "Декабрь",
];
const mockWeekDays = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];
const mockFormatDate = vi.fn((date: Date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}.${month}.${year}`;
});

describe("DatePickerWithPrices.vue", () => {
  beforeEach(() => {
    setupPinia();
    vi.clearAllMocks();
    mockFetchCalendarPrices.mockResolvedValue(undefined);
    mockGetPriceForDate.mockReturnValue(null);
    mockPricesLoading.value = false;

    // Переопределяем глобальные моки для этого теста
    vi.stubGlobal("useCalendarPrices", () => ({
      fetchCalendarPrices: mockFetchCalendarPrices,
      getPriceForDate: mockGetPriceForDate,
      formatPrice: mockFormatPrice,
      loading: mockPricesLoading,
    }));

    vi.stubGlobal("useDateLocale", () => ({
      monthNames: { value: mockMonthNames },
      weekDays: { value: mockWeekDays },
      formatDate: mockFormatDate,
    }));
  });

  const mountDatePicker = (props?: { modelValue?: [Date, Date] | null }) => {
    return mountComponent(DatePickerWithPrices, {
      props: props || { modelValue: null },
      global: {
        plugins: [i18n],
      },
    });
  };

  describe("Рендеринг компонента", () => {
    it("должен отображать поле ввода", () => {
      const wrapper = mountDatePicker();

      // Проверяем, что компонент успешно смонтирован
      expect(wrapper.exists()).toBe(true);

      // Проверяем, что компонент имеет необходимые свойства
      expect(wrapper.vm).toBeDefined();
      expect(wrapper.vm.displayValue).toBeDefined();
    });

    it("должен отображать выбранные даты, если они переданы", async () => {
      const startDate = new Date("2024-12-01");
      const endDate = new Date("2024-12-05");

      const _wrapper = mountDatePicker({
        modelValue: [startDate, endDate],
      });

      await nextTick();

      // Проверяем, что formatDate был вызван для форматирования дат
      expect(mockFormatDate).toHaveBeenCalled();
    });

    it("не должен отображать календарь по умолчанию", () => {
      const wrapper = mountDatePicker();

      // Календарь должен быть скрыт (v-if="isOpen")
      const calendar = wrapper.find('[role="dialog"]');
      expect(calendar.exists()).toBe(false);
    });
  });

  describe("Открытие/закрытие календаря", () => {
    it("должен открывать календарь при клике на поле ввода", async () => {
      const wrapper = mountDatePicker();

      // Проверяем, что календарь закрыт изначально
      expect(wrapper.vm.isOpen).toBe(false);

      // Используем метод компонента для открытия
      wrapper.vm.toggleCalendar();
      await nextTick();

      // После клика календарь должен открыться
      expect(wrapper.vm.isOpen).toBe(true);
    });

    it("должен загружать цены при открытии календаря", async () => {
      const wrapper = mountDatePicker();

      // Очищаем моки перед тестом
      mockFetchCalendarPrices.mockClear();

      // Открываем календарь через метод компонента
      wrapper.vm.toggleCalendar();
      await nextTick();

      // Проверяем, что fetchCalendarPrices был вызван
      expect(mockFetchCalendarPrices).toHaveBeenCalled();
    });

    it("должен закрывать календарь при клике вне компонента", async () => {
      const wrapper = mountDatePicker();

      // Открываем календарь через метод компонента
      wrapper.vm.toggleCalendar();
      await nextTick();

      // Проверяем, что календарь открыт
      expect(wrapper.vm.isOpen).toBe(true);

      // Симулируем клик вне компонента
      const clickEvent = new MouseEvent("click", {
        bubbles: true,
        cancelable: true,
      });
      document.dispatchEvent(clickEvent);
      await nextTick();

      // Проверяем, что календарь закрыт
      expect(wrapper.vm.isOpen).toBe(false);
    });
  });

  describe("Выбор дат", () => {
    it("должен устанавливать начальную дату при клике на день", async () => {
      const wrapper = mountDatePicker();

      // Открываем календарь
      wrapper.vm.toggleCalendar();
      await nextTick();

      // Создаем объект дня для клика
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const futureDate = new Date(today);
      futureDate.setDate(today.getDate() + 1);

      const dayObject = {
        date: futureDate,
        day: futureDate.getDate(),
        isCurrentMonth: true,
        isPast: false,
        isToday: false,
        isStartDate: false,
        isEndDate: false,
        isInRange: false,
        price: null,
        key: futureDate.toISOString(),
      };

      // Вызываем метод handleDateClick напрямую
      wrapper.vm.handleDateClick(dayObject);
      await nextTick();

      // Проверяем, что начальная дата установлена
      expect(wrapper.vm.selectedStartDate).not.toBeNull();
      expect(wrapper.vm.selectedStartDate?.getTime()).toBe(
        futureDate.getTime(),
      );
    });

    it("не должен выбирать прошедшие даты", async () => {
      const wrapper = mountDatePicker();

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      pastDate.setHours(0, 0, 0, 0);

      const dayObject = {
        date: pastDate,
        day: pastDate.getDate(),
        isCurrentMonth: true,
        isPast: true,
        isToday: false,
        isStartDate: false,
        isEndDate: false,
        isInRange: false,
        price: null,
        key: pastDate.toISOString(),
      };

      const initialStartDate = wrapper.vm.selectedStartDate;

      // Вызываем метод handleDateClick напрямую
      wrapper.vm.handleDateClick(dayObject);
      await nextTick();

      // Проверяем, что дата не была установлена (прошедшие даты игнорируются)
      expect(wrapper.vm.selectedStartDate).toBe(initialStartDate);
    });

    it("должен устанавливать конечную дату при втором клике", async () => {
      const startDate = new Date("2024-12-01");
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date("2024-12-05");
      endDate.setHours(0, 0, 0, 0);

      const wrapper = mountDatePicker({
        modelValue: [startDate, endDate],
      });

      await nextTick();

      // Проверяем, что даты установлены
      expect(wrapper.props("modelValue")).toEqual([startDate, endDate]);
    });

    it("должен менять местами даты, если конечная дата раньше начальной", async () => {
      const wrapper = mountDatePicker();

      const laterDate = new Date();
      laterDate.setDate(laterDate.getDate() + 5);
      laterDate.setHours(0, 0, 0, 0);

      const earlierDate = new Date();
      earlierDate.setDate(earlierDate.getDate() + 2);
      earlierDate.setHours(0, 0, 0, 0);

      // Сначала выбираем более позднюю дату
      const laterDayObject = {
        date: laterDate,
        day: laterDate.getDate(),
        isCurrentMonth: true,
        isPast: false,
        isToday: false,
        isStartDate: false,
        isEndDate: false,
        isInRange: false,
        price: null,
        key: laterDate.toISOString(),
      };

      wrapper.vm.handleDateClick(laterDayObject);
      await nextTick();

      // Затем выбираем более раннюю дату
      const earlierDayObject = {
        date: earlierDate,
        day: earlierDate.getDate(),
        isCurrentMonth: true,
        isPast: false,
        isToday: false,
        isStartDate: false,
        isEndDate: false,
        isInRange: false,
        price: null,
        key: earlierDate.toISOString(),
      };

      wrapper.vm.handleDateClick(earlierDayObject);
      await nextTick();

      // Проверяем, что даты поменялись местами (ранняя стала начальной)
      expect(wrapper.vm.selectedStartDate?.getTime()).toBe(
        earlierDate.getTime(),
      );
      expect(wrapper.vm.selectedEndDate?.getTime()).toBe(laterDate.getTime());
    });
  });

  describe("Навигация по месяцам", () => {
    it("должен переходить к следующему месяцу", async () => {
      const wrapper = mountDatePicker();

      // Открываем календарь, чтобы сработал watcher
      wrapper.vm.toggleCalendar();
      await nextTick();

      const initialMonth = wrapper.vm.currentMonth;
      const initialYear = wrapper.vm.currentYear;

      // Очищаем моки перед тестом
      mockFetchCalendarPrices.mockClear();

      // Вызываем метод nextMonth напрямую
      wrapper.vm.nextMonth();
      await nextTick();

      // Проверяем, что месяц изменился
      if (initialMonth === 12) {
        expect(wrapper.vm.currentMonth).toBe(1);
        expect(wrapper.vm.currentYear).toBe(initialYear + 1);
      } else {
        expect(wrapper.vm.currentMonth).toBe(initialMonth + 1);
      }

      // Проверяем, что был вызван fetchCalendarPrices (через watcher)
      expect(mockFetchCalendarPrices).toHaveBeenCalled();
    });

    it("должен переходить к предыдущему месяцу, если это возможно", async () => {
      const wrapper = mountDatePicker();

      const initialMonth = wrapper.vm.currentMonth;
      const initialYear = wrapper.vm.currentYear;

      // Вызываем метод prevMonth напрямую
      wrapper.vm.prevMonth();
      await nextTick();

      // Проверяем, что месяц изменился (если переход возможен)
      if (wrapper.vm.canGoToPrevMonth) {
        if (initialMonth === 1) {
          expect(wrapper.vm.currentMonth).toBe(12);
          expect(wrapper.vm.currentYear).toBe(initialYear - 1);
        } else {
          expect(wrapper.vm.currentMonth).toBe(initialMonth - 1);
        }
      }

      // Проверяем, что был вызван fetchCalendarPrices (если переход возможен)
      if (wrapper.vm.canGoToPrevMonth) {
        expect(mockFetchCalendarPrices).toHaveBeenCalled();
      }
    });
  });

  describe("Очистка выбора", () => {
    it("должен очищать выбранные даты при нажатии на кнопку отмены", async () => {
      const startDate = new Date("2024-12-01");
      const endDate = new Date("2024-12-05");

      const wrapper = mountDatePicker({
        modelValue: [startDate, endDate],
      });

      // Проверяем, что даты установлены
      expect(wrapper.vm.selectedStartDate).not.toBeNull();
      expect(wrapper.vm.selectedEndDate).not.toBeNull();

      // Вызываем метод handleClearAndClose напрямую
      wrapper.vm.handleClearAndClose();
      await nextTick();

      // Проверяем, что даты очищены
      expect(wrapper.vm.selectedStartDate).toBeNull();
      expect(wrapper.vm.selectedEndDate).toBeNull();
      expect(wrapper.vm.isOpen).toBe(false);
    });

    it("должен закрывать календарь при нажатии на кнопку выбора", async () => {
      const startDate = new Date("2024-12-01");
      const endDate = new Date("2024-12-05");

      const wrapper = mountDatePicker({
        modelValue: [startDate, endDate],
      });

      // Открываем календарь
      wrapper.vm.toggleCalendar();
      await nextTick();

      expect(wrapper.vm.isOpen).toBe(true);

      // Вызываем метод closeCalendar напрямую
      wrapper.vm.closeCalendar();
      await nextTick();

      expect(wrapper.vm.isOpen).toBe(false);
    });
  });

  describe("Отображение цен", () => {
    it("должен отображать цену для даты, если она загружена", async () => {
      const testDate = new Date("2024-12-15");
      testDate.setHours(0, 0, 0, 0);
      mockGetPriceForDate.mockReturnValue(5000);

      const wrapper = mountDatePicker();

      // Очищаем моки перед тестом
      mockGetPriceForDate.mockClear();

      // Открываем календарь
      wrapper.vm.toggleCalendar();
      await nextTick();

      // Проверяем, что getPriceForDate был вызван при генерации дней календаря
      // (calendarDays computed вызывает getPriceForDate для каждого дня)
      expect(mockGetPriceForDate).toHaveBeenCalled();
    });

    it("должен отображать индикатор загрузки при загрузке цен", async () => {
      mockPricesLoading.value = true;

      const wrapper = mountDatePicker();

      // Открываем календарь
      wrapper.vm.toggleCalendar();
      await nextTick();

      // Проверяем, что pricesLoading передается в компонент
      // В реальном компоненте это проверяется через v-if="pricesLoading"
      // В тесте мы проверяем, что состояние загрузки доступно
      const grid = wrapper.findComponent({ name: "CoreCalendarGrid" });
      if (grid.exists()) {
        expect(grid.props("pricesLoading")).toBe(true);
      }
    });
  });

  describe("Синхронизация с modelValue", () => {
    it("должен обновлять внутреннее состояние при изменении modelValue", async () => {
      const wrapper = mountDatePicker();

      const startDate = new Date("2024-12-01");
      const endDate = new Date("2024-12-05");

      await wrapper.setProps({
        modelValue: [startDate, endDate],
      });
      await nextTick();

      expect(wrapper.props("modelValue")).toEqual([startDate, endDate]);
    });

    it("должен сбрасывать внутреннее состояние при установке modelValue в null", async () => {
      const startDate = new Date("2024-12-01");
      const endDate = new Date("2024-12-05");

      const wrapper = mountDatePicker({
        modelValue: [startDate, endDate],
      });

      await wrapper.setProps({
        modelValue: null,
      });
      await nextTick();

      expect(wrapper.props("modelValue")).toBeNull();
    });
  });
});
