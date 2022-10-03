// experimenting with Autobind decorator
// const Autobind = (
//   target: any,
//   methodName: string,
//   descriptor: PropertyDescriptor
// ) => {
//   const originalMethod = descriptor.value;
//   const adjustedDescriptor: PropertyDescriptor = {
//     configurable: true,
//     get() {
//       const boundFunction = originalMethod.bind(this);
//       return boundFunction;
//     },
//   };
//   return adjustedDescriptor;
// };

//Class Project Type

enum ProjectStatus {
  Active,
  Finished,
}

class Project {
  constructor(
    public id: string,
    public title: string,
    public description: string,
    public people: number,
    public status: ProjectStatus
  ) {}
}

// State Management Class
type Listener = (items: Project[]) => void;

class ProjectState {
  private listeners: Listener[] = [];
  private projects: Project[] = [];
  private static instance: ProjectState;

  private constructor() {}

  static getInstance = () => {
    if (this.instance) {
      return this.instance;
    }
    this.instance = new ProjectState();
    return this.instance;
  };

  addListener = (listenerFn: Listener) => {
    this.listeners.push(listenerFn);
  };

  addProject = (title: string, description: string, numberOfPeople: number) => {
    const newProject = new Project(
      Math.random().toString(),
      title,
      description,
      numberOfPeople,
      ProjectStatus.Active
    );
    this.projects.push(newProject);
    for (const listenerFn of this.listeners) {
      listenerFn(this.projects.slice());
    }
  };
}

const ProjectStateInstance = ProjectState.getInstance();

//  Form Validation
interface ValueToBeValidated {
  value: string | number;
  required?: boolean;
  minLength?: number;
  maxLength?: number;
  min?: number;
  max?: number;
}

const HandleValidation = (validatableInput: ValueToBeValidated) => {
  let isValid = true;
  if (validatableInput.required) {
    isValid = isValid && validatableInput.value.toString().trim().length !== 0;
  }
  if (
    validatableInput.minLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length >= validatableInput.minLength;
  }
  if (
    validatableInput.maxLength != null &&
    typeof validatableInput.value === "string"
  ) {
    isValid =
      isValid && validatableInput.value.length <= validatableInput.maxLength;
  }
  if (
    validatableInput.min != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value >= validatableInput.min;
  }
  if (
    validatableInput.max != null &&
    typeof validatableInput.value === "number"
  ) {
    isValid = isValid && validatableInput.value <= validatableInput.max;
  }
  return isValid;
};

// Project List Class
class ProjectList {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLElement;
  assignedProjects: Project[];

  constructor(private type: "active" | "finished") {
    this.templateElement = document.getElementById(
      "project-list"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;
    this.assignedProjects = [];

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );

    this.element = importedNode.firstElementChild as HTMLElement;
    this.element.id = `${this.type}-projects`;

    ProjectStateInstance.addListener((projects: Project[]) => {
      this.assignedProjects = projects;
      this.renderProjects();
    });

    this.attach();
    this.renderContent();
  }

  private renderProjects = () => {
    const listEl = document.getElementById(
      `${this.type}-project-list`
    )! as HTMLUListElement;
    for (const projectItem of this.assignedProjects) {
      const listItem = document.createElement("li");
      listItem.textContent = projectItem.title;
      listEl.appendChild(listItem);
    }
  };

  private renderContent = () => {
    const listId = `${this.type}-project-list`;
    this.element.querySelector("ul")!.id = listId;
    this.element.querySelector("h2"!)!.textContent =
      this.type.toUpperCase() + " PROJECTS";
  };

  private attach = () => {
    this.hostElement.insertAdjacentElement("beforeend", this.element);
  };
}

// Project Input Class
class ProjectInput {
  templateElement: HTMLTemplateElement;
  hostElement: HTMLDivElement;
  element: HTMLFormElement;
  titleInputElement: HTMLInputElement;
  descriptionInputElement: HTMLInputElement;
  peopleInputElement: HTMLInputElement;

  constructor() {
    this.templateElement = document.getElementById(
      "project-input"
    )! as HTMLTemplateElement;
    this.hostElement = document.getElementById("app")! as HTMLDivElement;

    const importedNode = document.importNode(
      this.templateElement.content,
      true
    );

    this.element = importedNode.firstElementChild as HTMLFormElement; // This is the descendant form element
    this.element.id = "user-input";
    this.titleInputElement = this.element.querySelector(
      "#title"
    ) as HTMLInputElement;
    this.descriptionInputElement = this.element.querySelector(
      "#description"
    ) as HTMLInputElement;
    this.peopleInputElement = this.element.querySelector(
      "#people"
    ) as HTMLInputElement;

    this.configure();
    this.attachHtmlElement();
  }

  private attachHtmlElement = () => {
    this.hostElement.insertAdjacentElement("afterbegin", this.element);
  };

  // @Autobind
  //I used arrow functions in defining the class methods,
  // to avoid using this decorator or to bind the this specifically
  private submitHandler = (evt: Event) => {
    evt.preventDefault();
    const userInput = this.gatherUserInput();
    if (Array.isArray(userInput)) {
      const [title, description, people] = userInput;
      ProjectStateInstance.addProject(title, description, people);
      console.log(title, description, people);
    }
    this.clearInputContent();
  };

  //******     Method Definitions
  private configure = () => {
    this.element.addEventListener("submit", this.submitHandler);
  };

  private gatherUserInput = (): [string, string, number] | void => {
    const enteredTitle = this.titleInputElement.value;
    const enteredDescription = this.descriptionInputElement.value;
    const enteredPeople = this.peopleInputElement.value;

    const titleToBeValidated: ValueToBeValidated = {
      value: enteredTitle,
      required: true,
    };
    const descriptionToBeValidated: ValueToBeValidated = {
      value: enteredDescription,
      required: true,
      minLength: 5,
    };
    const peopleToBeValidated: ValueToBeValidated = {
      value: +enteredPeople,
      required: true,
      min: 1,
      max: 5,
    };

    if (
      !HandleValidation(titleToBeValidated) ||
      !HandleValidation(descriptionToBeValidated) ||
      !HandleValidation(peopleToBeValidated)
    ) {
      alert("Please fill the form.");
    } else {
      return [enteredTitle, enteredDescription, Number(enteredPeople)];
    }
  };

  private clearInputContent = () => {
    this.titleInputElement.value = "";
    this.descriptionInputElement.value = "";
    this.peopleInputElement.value = "";
  };

  // ******* End of Methods Definitions
}

const Form = new ProjectInput();
const activeList = new ProjectList("active");
const finishedList = new ProjectList("finished");
