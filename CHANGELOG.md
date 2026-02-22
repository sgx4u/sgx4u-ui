# Changelog

All notable changes to `@sgx4u/ui` are documented in this file.

## [1.0.0]

#### Date - 20th Feb 2026

### Added

- Initial public release of `@sgx4u/ui`.
- CLI commands: init, add, list, info, config, help with registry + dependency resolution.
- Elements:
    - `accordion`: A vertically stacked set of interactive headings that each reveal a section of content.
    - `aspect-ratio`: Responsive aspect-ratio wrapper that locks its children to a given proportion.
    - `auto-complete`: Text input that suggests and lets users pick from a filtered list of options as they type.
    - `avatar`: A visual representation of a user, typically displayed as a circular or rounded image with an optional fallback.
    - `backdrop`: A blurred layer that sits behind overlays.
    - `background`: Decorative background components for applying animated gradients and ambient color effects behind your UI.
    - `badge`: Compact label used to display counts, statuses, or short pieces of metadata.
    - `breadcrumb`: A horizontal trail of links that helps users understand and navigate the hierarchy of a site or app.
    - `button`: Pressable control used to trigger actions or events, with support for visual variants, sizes, and loading states.
    - `button-group`: Layout helper that visually groups adjacent `Button` instances, merging borders and radii for horizontal or vertical toolbars while keeping each button focusable.
    - `card`: Layout wrapper used to display content in a card format.
    - `checkbox`: A square box that users can check or uncheck to represent boolean choices or multi-select lists.
    - `click-away-listener`: Click away listener that uses a unique data-click-away-id for outside click detection.
    - `container`: Layout wrapper used to arrange and align content using consistent flex or grid primitives.
    - `dialog`: A window overlaid on the current page that focuses the user on a specific task or piece of information.
    - `dropdown-menu`: A menu that appears when a user interacts with a trigger, typically used for contextual actions and navigation.
    - `focus-trap`: Focus management utility that traps keyboard focus within its children, restores the previously focused element on cleanup, and guards against focus escaping via mouse or script.
    - `highlight`: Text helper that visually emphasizes matches within content, often used for search results.
    - `hover-card`: A small floating panel that reveals supplemental content when users hover or focus a trigger element.
    - `icons`: Small reusable icon components, including controls like the password show/hide toggle.
    - `image`: Enhanced image primitives for displaying pictures with optional progressive loading and performance-friendly defaults.
    - `indicators`: Small visual markers, such as asterisks, used to call out required or special fields in forms.
    - `input`: Single-line text field for capturing short pieces of information such as names, emails, or search queries.
    - `label`: Text caption that describes and links to a form control, often showing required or validation state.
    - `link`: A navigational element that takes users to another page, view, or section when activated.
    - `list`: A semantic container for ordered or unordered groups of related list items.
    - `list-item`: A single item inside a list, typically representing one entry in a collection of related content.
    - `loader`: Visual indicator that communicates to users that content or actions are in progress.
    - `popover`: A floating panel anchored to a trigger element, used to display contextual content without blocking the rest of the page.
    - `portal`: Mechanism for rendering content into a different part of the DOM tree, often used for overlays and dialogs.
    - `radio`: Single-selection form control typically used in groups where only one option can be active at a time.
    - `select`: A dropdown control for choosing one or more options from a list, with an optional searchable variant.
    - `separator`: Thin rule used to visually divide groups of content or UI controls.
    - `sheet`: A panel that slides in from the edge of the screen to display contextual content without leaving the current page.
    - `skeleton`: Placeholder UI used to represent content that is still loading.
    - `slot`: Composition utility that lets components render their children as the actual DOM element while still receiving styling and behavior.
    - `switch`: A two-state toggle used for turning a setting or feature on and off.
    - `table`: A tabular data structure that organizes information into rows and columns.
    - `tabs`: A set of stacked triggers that switch between different views or panels in the same space.
    - `text`: Typography primitive for rendering semantic headings, paragraphs, and inline text.
    - `text-style`: Inline text formatting primitives for emphasizing, underlining, or annotating existing content.
    - `textarea`: Multiline text field for collecting longer free-form input such as comments, notes, or descriptions.
    - `timeline`: Visual representation of a sequence of events or steps in a process.
    - `toggle`: A pressable control that switches between on and off states, similar to a button with persistent pressed state.
    - `tooltip`: A brief, non-interactive label that appears on hover or focus to describe another element.
    - `visually-hidden`: Utility for content that should be available to screen readers but not visible on screen.
