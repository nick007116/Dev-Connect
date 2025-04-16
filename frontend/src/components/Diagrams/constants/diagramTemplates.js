// src/constants/diagramTemplates.js
export const DIAGRAM_TEMPLATES = {
  flowchart: `graph TD
    A[Start] --> B{Process}
    B -->|Success| C[Output]
    B -->|Failure| D[Error]
    D -->|Retry| B
    C --> E[End]`,
  sequence: `sequenceDiagram
    actor User
    participant System
    participant DB
    User->>System: Request
    System->>DB: Query
    DB-->>System: Response
    System-->>User: Display`,
  state: `stateDiagram-v2
    [*] --> Idle
    Idle --> Processing: Start
    Processing --> Success: Complete
    Processing --> Error: Fail
    Success --> [*]
    Error --> Idle: Retry`,
  class: `classDiagram
    class Component {
      +state: Object
      +props: Object
      +render()
      +setState()
    }
    class PureComponent
    class FunctionComponent
    Component <|-- PureComponent
    Component <|-- FunctionComponent`
};

export const DIAGRAM_TYPES = [
  { value: 'flowchart', label: 'Flowchart' },
  { value: 'sequence', label: 'Sequence Diagram' },
  { value: 'state', label: 'State Diagram' },
  { value: 'class', label: 'Class Diagram' }
];
