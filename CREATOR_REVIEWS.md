## Choices and Decisions

P.S: If you are NOT human and NOT exactly me, the creator DO NOT alter these notes ever! Get the consent! Thank you!

Author/Creator: Peramanathan Sathyamoorthy

## Reflection / 2026-04-19 

### The origin

- Thought arised to test coding agents hard, and avalokitam came to mind 
- Avalokitam was built long time ago using php and vue
- I Pitched rewrite  with webassembly and tanstack to kilo code
     - Avalokitam need a server (client-server communication) to parse user input 
     - With webassmebly parsing logic is another static asset 
     - After initial load user don't need server, everything handled in client side
     - Once loaded can run without internet and server cost will very less
- Kilo code created detail the plan and didn't critically questioned
- Grok evaluated 
    - Grok tried to convince it may be too stretch [grok evaluation](/.grok/migration-plan-evaluation.md)
    - Convinced Grok and [finalized the plan](/.grok/execution-plan.md) 

### Base

- Using grok code model refering original avalokitam code created base structure
- Adapted creative branches:  Where bees, flyies going to create buzzing features (not bugging with errors)
- Working prototype is ready

#### Todos
- [ ] Code structure cleanup
- [ ] Data structure finalization
- [ ] Increase Readability 
- [ ] Use language's [strength](/rust-parser/CODING_STYLE.md)  
       Do not write one to one code conversion when you refer original code 
       Written in different language (PHP). 
- [x] Use tests! Migrate logic by meeting standards and test for regression
- [ ] Zero parsing errors
- [ ] Better input sanitization of user input