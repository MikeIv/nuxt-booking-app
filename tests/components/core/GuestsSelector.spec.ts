import { describe, it, expect, vi, beforeEach } from "vitest";
import { nextTick } from "vue";
import GuestsSelector from "~/components/core/GuestsSelector.vue";
import { setupPinia, mountComponent } from "../../utils/test-utils";
import type { GuestsValue } from "~/components/core/GuestsSelector.vue";
import { AGE_MIN, AGE_MAX } from "~/utils/age";

interface OverlayRef {
  toggle: (event: Event) => void;
  hide: (event: Event) => void;
}

interface ComponentInstance {
  overlayRef?: OverlayRef;
  openOverlay: (event: Event) => void;
  applyChanges: (event: Event) => void;
  [key: string]: unknown;
}

describe("GuestsSelector.vue", () => {
  let mockToggle: ReturnType<typeof vi.fn>;
  let mockHide: ReturnType<typeof vi.fn>;
  let overlayRef: {
    toggle: ReturnType<typeof vi.fn>;
    hide: ReturnType<typeof vi.fn>;
  };

  beforeEach(() => {
    setupPinia();
    vi.clearAllMocks();

    mockToggle = vi.fn();
    mockHide = vi.fn();
    overlayRef = { toggle: mockToggle, hide: mockHide };
  });

  const mountGuestsSelector = (props?: {
    modelValue?:
      | GuestsValue
      | { rooms: number; adults: number; children: number };
  }) => {
    return mountComponent(GuestsSelector, {
      props: props || {
        modelValue: {
          rooms: 1,
          roomList: [{ adults: 1, children: 0, childrenAges: [] }],
        },
      },
      global: {
        stubs: {
          Popover: {
            template: '<div class="popover-stub"><slot /></div>',
            methods: {
              toggle: mockToggle,
              hide: mockHide,
            },
            expose: ["toggle", "hide"],
          },
          CoreCounter: {
            template:
              '<div class="counter-stub"><button class="decrease" @click="$emit(\'update:modelValue\', modelValue - 1)">-</button><span>{{ modelValue }}</span><button class="increase" @click="$emit(\'update:modelValue\', modelValue + 1)">+</button></div>',
            props: ["modelValue", "min", "max"],
            emits: ["update:modelValue"],
          },
          CoreRoomBlock: {
            template:
              '<div class="room-block-stub"><div>Номер {{ roomIndex + 1 }}</div><button class="delete-room" @click="$emit(\'delete\')">Удалить</button><button class="update-adults" @click="$emit(\'update:adults\', room.adults + 1)">+ Взрослый</button><button class="update-children" @click="$emit(\'update:children\', room.children + 1)">+ Ребенок</button></div>',
            props: ["room", "roomIndex", "totalRooms"],
            emits: [
              "update:adults",
              "update:children",
              "update:childAge",
              "delete",
            ],
          },
          Button: {
            template:
              "<button @click=\"$emit('click', $event)\"><slot /></button>",
            props: ["unstyled", "class"],
          },
          UIcon: {
            template: '<span class="icon-stub"></span>',
            props: ["name"],
          },
        },
      },
    });
  };

  describe("Инициализация компонента", () => {
    it("должен инициализироваться с дефолтными значениями, если modelValue не передан", () => {
      const wrapper = mountGuestsSelector();

      expect(wrapper.vm.guests.rooms).toBe(1);
      expect(wrapper.vm.guests.roomList).toHaveLength(1);
      expect(wrapper.vm.guests.roomList[0]).toEqual({
        adults: 1,
        children: 0,
        childrenAges: [],
      });
    });

    it("должен корректно обрабатывать новый формат данных (GuestsValue)", () => {
      const modelValue: GuestsValue = {
        rooms: 2,
        roomList: [
          { adults: 2, children: 1, childrenAges: [5] },
          { adults: 1, children: 0, childrenAges: [] },
        ],
      };

      const wrapper = mountGuestsSelector({ modelValue });

      expect(wrapper.vm.guests.rooms).toBe(2);
      expect(wrapper.vm.guests.roomList).toHaveLength(2);
      expect(wrapper.vm.guests.roomList[0]).toEqual({
        adults: 2,
        children: 1,
        childrenAges: [5],
      });
      expect(wrapper.vm.guests.roomList[1]).toEqual({
        adults: 1,
        children: 0,
        childrenAges: [],
      });
    });

    it("должен корректно обрабатывать legacy формат данных", () => {
      const modelValue = {
        rooms: 2,
        adults: 3,
        children: 2,
      };

      const wrapper = mountGuestsSelector({ modelValue });

      expect(wrapper.vm.guests.rooms).toBe(2);
      expect(wrapper.vm.guests.roomList).toHaveLength(2);
      expect(wrapper.vm.guests.roomList[0]).toEqual({
        adults: 3,
        children: 2,
        childrenAges: [AGE_MIN, AGE_MIN],
      });
      expect(wrapper.vm.guests.roomList[1]).toEqual({
        adults: 1,
        children: 0,
        childrenAges: [],
      });
    });

    it("должен нормализовать childrenAges при несоответствии количества детей", () => {
      const modelValue: GuestsValue = {
        rooms: 1,
        roomList: [
          { adults: 2, children: 3, childrenAges: [5] }, // только 1 возраст, но 3 ребенка
        ],
      };

      const wrapper = mountGuestsSelector({ modelValue });

      expect(wrapper.vm.guests.roomList[0].childrenAges).toHaveLength(3);
      expect(wrapper.vm.guests.roomList[0].childrenAges[0]).toBe(5);
      expect(wrapper.vm.guests.roomList[0].childrenAges[1]).toBe(AGE_MIN);
      expect(wrapper.vm.guests.roomList[0].childrenAges[2]).toBe(AGE_MIN);
    });
  });

  describe("Обновление количества номеров", () => {
    it("должен увеличивать количество номеров", async () => {
      const modelValue: GuestsValue = {
        rooms: 1,
        roomList: [{ adults: 2, children: 0, childrenAges: [] }],
      };
      const wrapper = mountGuestsSelector({ modelValue });

      wrapper.vm.updateRooms(2);
      await nextTick();

      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeTruthy();
      expect(emitted![0][0]).toEqual({
        rooms: 2,
        roomList: [
          { adults: 2, children: 0, childrenAges: [] },
          { adults: 1, children: 0, childrenAges: [] },
        ],
      });
    });

    it("должен уменьшать количество номеров", async () => {
      const modelValue: GuestsValue = {
        rooms: 3,
        roomList: [
          { adults: 2, children: 0, childrenAges: [] },
          { adults: 1, children: 0, childrenAges: [] },
          { adults: 1, children: 0, childrenAges: [] },
        ],
      };
      const wrapper = mountGuestsSelector({ modelValue });

      wrapper.vm.updateRooms(2);
      await nextTick();

      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeTruthy();
      expect(emitted![0][0].rooms).toBe(2);
      expect(emitted![0][0].roomList).toHaveLength(2);
    });

    it("не должен уменьшать количество номеров ниже 1", async () => {
      const modelValue: GuestsValue = {
        rooms: 1,
        roomList: [{ adults: 2, children: 0, childrenAges: [] }],
      };
      const wrapper = mountGuestsSelector({ modelValue });

      wrapper.vm.updateRooms(0);
      await nextTick();

      // Не должно быть emit, так как значение не изменилось
      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeFalsy();
    });

    it("не должен увеличивать количество номеров выше MAX_ROOMS", async () => {
      const modelValue: GuestsValue = {
        rooms: 5,
        roomList: Array.from({ length: 5 }, () => ({
          adults: 1,
          children: 0,
          childrenAges: [],
        })),
      };
      const wrapper = mountGuestsSelector({ modelValue });

      wrapper.vm.updateRooms(10);
      await nextTick();

      // Не должно быть emit, так как значение не изменилось
      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeFalsy();
    });

    it("не должен обновлять, если значение не изменилось", async () => {
      const modelValue: GuestsValue = {
        rooms: 2,
        roomList: [
          { adults: 2, children: 0, childrenAges: [] },
          { adults: 1, children: 0, childrenAges: [] },
        ],
      };
      const wrapper = mountGuestsSelector({ modelValue });

      wrapper.vm.updateRooms(2);
      await nextTick();

      // Не должно быть emit, так как значение не изменилось
      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeFalsy();
    });
  });

  describe("Удаление номера", () => {
    it("должен удалять номер по индексу", async () => {
      const modelValue: GuestsValue = {
        rooms: 3,
        roomList: [
          { adults: 2, children: 0, childrenAges: [] },
          { adults: 1, children: 0, childrenAges: [] },
          { adults: 1, children: 0, childrenAges: [] },
        ],
      };
      const wrapper = mountGuestsSelector({ modelValue });

      wrapper.vm.deleteRoom(1);
      await nextTick();

      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeTruthy();
      expect(emitted![0][0].rooms).toBe(2);
      expect(emitted![0][0].roomList).toHaveLength(2);
      expect(emitted![0][0].roomList[0].adults).toBe(2);
      expect(emitted![0][0].roomList[1].adults).toBe(1);
    });

    it("не должен удалять номер, если остался только один", async () => {
      const modelValue: GuestsValue = {
        rooms: 1,
        roomList: [{ adults: 2, children: 0, childrenAges: [] }],
      };
      const wrapper = mountGuestsSelector({ modelValue });

      wrapper.vm.deleteRoom(0);
      await nextTick();

      // Не должно быть emit, так как удаление не произошло
      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeFalsy();
    });
  });

  describe("Обновление количества взрослых", () => {
    it("должен обновлять количество взрослых в указанном номере", async () => {
      const modelValue: GuestsValue = {
        rooms: 2,
        roomList: [
          { adults: 2, children: 0, childrenAges: [] },
          { adults: 1, children: 0, childrenAges: [] },
        ],
      };
      const wrapper = mountGuestsSelector({ modelValue });

      wrapper.vm.updateRoomAdults(0, 3);
      await nextTick();

      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeTruthy();
      expect(emitted![0][0].roomList[0].adults).toBe(3);
      expect(emitted![0][0].roomList[1].adults).toBe(1);
    });

    it("не должен уменьшать количество взрослых ниже 1", async () => {
      const modelValue: GuestsValue = {
        rooms: 1,
        roomList: [{ adults: 2, children: 0, childrenAges: [] }],
      };
      const wrapper = mountGuestsSelector({ modelValue });

      wrapper.vm.updateRoomAdults(0, 0);
      await nextTick();

      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeTruthy();
      expect(emitted![0][0].roomList[0].adults).toBe(1);
    });
  });

  describe("Обновление количества детей", () => {
    it("должен обновлять количество детей в указанном номере", async () => {
      const modelValue: GuestsValue = {
        rooms: 1,
        roomList: [{ adults: 2, children: 0, childrenAges: [] }],
      };
      const wrapper = mountGuestsSelector({ modelValue });

      wrapper.vm.updateRoomChildren(0, 2);
      await nextTick();

      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeTruthy();
      expect(emitted![0][0].roomList[0].children).toBe(2);
      expect(emitted![0][0].roomList[0].childrenAges).toHaveLength(2);
      expect(emitted![0][0].roomList[0].childrenAges[0]).toBe(AGE_MIN);
      expect(emitted![0][0].roomList[0].childrenAges[1]).toBe(AGE_MIN);
    });

    it("должен сохранять существующие возрасты при увеличении количества детей", async () => {
      const modelValue: GuestsValue = {
        rooms: 1,
        roomList: [{ adults: 2, children: 1, childrenAges: [5] }],
      };
      const wrapper = mountGuestsSelector({ modelValue });

      wrapper.vm.updateRoomChildren(0, 3);
      await nextTick();

      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeTruthy();
      expect(emitted![0][0].roomList[0].children).toBe(3);
      expect(emitted![0][0].roomList[0].childrenAges).toHaveLength(3);
      expect(emitted![0][0].roomList[0].childrenAges[0]).toBe(5);
      expect(emitted![0][0].roomList[0].childrenAges[1]).toBe(AGE_MIN);
      expect(emitted![0][0].roomList[0].childrenAges[2]).toBe(AGE_MIN);
    });

    it("должен обрезать возрасты при уменьшении количества детей", async () => {
      const modelValue: GuestsValue = {
        rooms: 1,
        roomList: [{ adults: 2, children: 3, childrenAges: [5, 7, 9] }],
      };
      const wrapper = mountGuestsSelector({ modelValue });

      wrapper.vm.updateRoomChildren(0, 1);
      await nextTick();

      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeTruthy();
      expect(emitted![0][0].roomList[0].children).toBe(1);
      expect(emitted![0][0].roomList[0].childrenAges).toHaveLength(1);
      expect(emitted![0][0].roomList[0].childrenAges[0]).toBe(5);
    });

    it("не должен уменьшать количество детей ниже 0", async () => {
      const modelValue: GuestsValue = {
        rooms: 1,
        roomList: [{ adults: 2, children: 1, childrenAges: [5] }],
      };
      const wrapper = mountGuestsSelector({ modelValue });

      wrapper.vm.updateRoomChildren(0, -1);
      await nextTick();

      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeTruthy();
      expect(emitted![0][0].roomList[0].children).toBe(0);
      expect(emitted![0][0].roomList[0].childrenAges).toHaveLength(0);
    });
  });

  describe("Обновление возраста ребенка", () => {
    it("должен обновлять возраст конкретного ребенка", async () => {
      const modelValue: GuestsValue = {
        rooms: 1,
        roomList: [{ adults: 2, children: 2, childrenAges: [5, 7] }],
      };
      const wrapper = mountGuestsSelector({ modelValue });

      wrapper.vm.updateChildAge(0, 1, 8);
      await nextTick();

      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeTruthy();
      expect(emitted![0][0].roomList[0].childrenAges[0]).toBe(5);
      expect(emitted![0][0].roomList[0].childrenAges[1]).toBe(8);
    });

    it("не должен устанавливать возраст выше AGE_MAX", async () => {
      const modelValue: GuestsValue = {
        rooms: 1,
        roomList: [{ adults: 2, children: 1, childrenAges: [5] }],
      };
      const wrapper = mountGuestsSelector({ modelValue });

      wrapper.vm.updateChildAge(0, 0, 20);
      await nextTick();

      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeTruthy();
      expect(emitted![0][0].roomList[0].childrenAges[0]).toBe(AGE_MAX);
    });

    it("не должен устанавливать возраст ниже AGE_MIN", async () => {
      const modelValue: GuestsValue = {
        rooms: 1,
        roomList: [{ adults: 2, children: 1, childrenAges: [5] }],
      };
      const wrapper = mountGuestsSelector({ modelValue });

      wrapper.vm.updateChildAge(0, 0, -5);
      await nextTick();

      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeTruthy();
      expect(emitted![0][0].roomList[0].childrenAges[0]).toBe(AGE_MIN);
    });
  });

  describe("Формирование summaryString", () => {
    it("должен корректно формировать строку для одного номера", () => {
      const wrapper = mountGuestsSelector({
        modelValue: {
          rooms: 1,
          roomList: [{ adults: 2, children: 1, childrenAges: [5] }],
        },
      });

      const summary = wrapper.vm.summaryString;
      expect(summary).toContain("1 номер");
      expect(summary).toContain("2 взр.");
      expect(summary).toContain("1 дет.");
    });

    it("должен корректно формировать строку для нескольких номеров", () => {
      const wrapper = mountGuestsSelector({
        modelValue: {
          rooms: 3,
          roomList: [
            { adults: 2, children: 1, childrenAges: [5] },
            { adults: 1, children: 0, childrenAges: [] },
            { adults: 2, children: 2, childrenAges: [3, 7] },
          ],
        },
      });

      const summary = wrapper.vm.summaryString;
      expect(summary).toContain("3 номера");
      expect(summary).toContain("5 взр.");
      expect(summary).toContain("3 дет.");
    });

    it("должен корректно формировать строку без детей", () => {
      const wrapper = mountGuestsSelector({
        modelValue: {
          rooms: 2,
          roomList: [
            { adults: 2, children: 0, childrenAges: [] },
            { adults: 1, children: 0, childrenAges: [] },
          ],
        },
      });

      const summary = wrapper.vm.summaryString;
      expect(summary).toContain("2 номера");
      expect(summary).toContain("3 взр.");
      expect(summary).toContain("0 дет.");
    });
  });

  describe("Работа с overlay", () => {
    it("должен открывать overlay при клике на input", async () => {
      const modelValue: GuestsValue = {
        rooms: 1,
        roomList: [{ adults: 2, children: 0, childrenAges: [] }],
      };
      const wrapper = mountGuestsSelector({ modelValue });

      // Устанавливаем ref на overlay
      (wrapper.vm as ComponentInstance).overlayRef = overlayRef;

      // Вызываем метод напрямую для проверки
      const event = new Event("click");
      wrapper.vm.openOverlay(event);

      // Проверяем, что метод toggle был вызван
      expect(mockToggle).toHaveBeenCalledWith(event);
    });

    it("должен применять изменения и закрывать overlay", async () => {
      const modelValue: GuestsValue = {
        rooms: 1,
        roomList: [{ adults: 2, children: 0, childrenAges: [] }],
      };
      const wrapper = mountGuestsSelector({ modelValue });

      (wrapper.vm as ComponentInstance).overlayRef = overlayRef;

      const event = new Event("click");
      wrapper.vm.applyChanges(event);
      await nextTick();

      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeTruthy();
      expect(mockHide).toHaveBeenCalledWith(event);
    });
  });

  describe("Рендеринг компонента", () => {
    it("должен отображать input с summaryString", () => {
      const modelValue: GuestsValue = {
        rooms: 1,
        roomList: [{ adults: 2, children: 1, childrenAges: [5] }],
      };
      const wrapper = mountGuestsSelector({ modelValue });

      const input = wrapper.find("input");
      expect(input.exists()).toBe(true);
      expect(input.attributes("aria-label")).toContain("Гости:");
      expect((input.element as HTMLInputElement).value).toContain("1 номер");
    });

    it("должен отображать label 'Гости'", () => {
      const modelValue: GuestsValue = {
        rooms: 1,
        roomList: [{ adults: 1, children: 0, childrenAges: [] }],
      };
      const wrapper = mountGuestsSelector({ modelValue });

      // Ищем span с текстом "Гости"
      const labels = wrapper.findAll("span");
      const label = labels.find((span) => span.text() === "Гости");
      expect(label).toBeTruthy();
      expect(label?.exists()).toBe(true);
    });

    it("должен отображать CoreCounter для количества номеров", () => {
      const modelValue: GuestsValue = {
        rooms: 2,
        roomList: [
          { adults: 2, children: 0, childrenAges: [] },
          { adults: 1, children: 0, childrenAges: [] },
        ],
      };
      const wrapper = mountGuestsSelector({ modelValue });

      const counter = wrapper.findComponent(".counter-stub");
      expect(counter.exists()).toBe(true);
    });

    it("должен отображать CoreRoomBlock для каждого номера", () => {
      const modelValue: GuestsValue = {
        rooms: 2,
        roomList: [
          { adults: 2, children: 1, childrenAges: [5] },
          { adults: 1, children: 0, childrenAges: [] },
        ],
      };
      const wrapper = mountGuestsSelector({ modelValue });

      const roomBlocks = wrapper.findAllComponents(".room-block-stub");
      expect(roomBlocks).toHaveLength(2);
    });

    it("должен отображать кнопку 'Готово'", () => {
      const modelValue: GuestsValue = {
        rooms: 1,
        roomList: [{ adults: 1, children: 0, childrenAges: [] }],
      };
      const wrapper = mountGuestsSelector({ modelValue });

      // Ищем кнопку с текстом "Готово"
      const buttons = wrapper.findAll("button");
      const applyButton = buttons.find((btn) => btn.text().trim() === "Готово");
      expect(applyButton).toBeTruthy();
      if (applyButton) {
        expect(applyButton.exists()).toBe(true);
      }
    });
  });

  describe("Интеграция с дочерними компонентами", () => {
    it("должен обновлять количество номеров при изменении CoreCounter", async () => {
      const modelValue: GuestsValue = {
        rooms: 1,
        roomList: [{ adults: 2, children: 0, childrenAges: [] }],
      };
      const wrapper = mountGuestsSelector({ modelValue });

      const counter = wrapper.findComponent(".counter-stub");
      const increaseButton = counter.find(".increase");

      await increaseButton.trigger("click");
      await nextTick();

      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeTruthy();
      expect(emitted![0][0].rooms).toBe(2);
    });

    it("должен удалять номер при клике на кнопку удаления в RoomBlock", async () => {
      const modelValue: GuestsValue = {
        rooms: 2,
        roomList: [
          { adults: 2, children: 0, childrenAges: [] },
          { adults: 1, children: 0, childrenAges: [] },
        ],
      };
      const wrapper = mountGuestsSelector({ modelValue });

      const roomBlocks = wrapper.findAllComponents(".room-block-stub");
      const deleteButton = roomBlocks[1].find(".delete-room");

      await deleteButton.trigger("click");
      await nextTick();

      const emitted = wrapper.emitted("update:modelValue");
      expect(emitted).toBeTruthy();
      expect(emitted![0][0].rooms).toBe(1);
      expect(emitted![0][0].roomList).toHaveLength(1);
    });
  });
});
