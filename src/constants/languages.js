
export const LANGUAGES = [
    {
        id: 'javascript',
        name: 'JavaScript',
        version: '18.15.0',
        extension: 'js',
        defaultValue: `// JavaScript Online Compiler

function main() {
    console.log("Hello, World!");
    
    // Example: Array operations
    const numbers = [1, 2, 3, 4, 5];
    const user = {
        name: "Developer",
        role: "Admin"
    };

    console.log(\`Running as \${user.name}\`);
}

main();
`
    },
    {
        id: 'python',
        name: 'Python',
        version: '3.10.0',
        extension: 'py',
        defaultValue: `# Python Online Compiler

def main():
    print("Hello, World!")
    
    # Example: List and Dictionary
    numbers = [1, 2, 3, 4, 5]
    user = {
        "name": "Developer",
        "role": "Admin"
    }
    
    print(f"Running as {user['name']}")

if __name__ == "__main__":
    main()
`
    },
    {
        id: 'java',
        name: 'Java',
        version: '15.0.2',
        extension: 'java',
        defaultValue: `// Java Online Compiler

public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
        
        // Example: Object
        User user = new User("Developer", "Admin");
        System.out.println("Running as " + user.name);
    }
}

class User {
    String name;
    String role;
    
    public User(String name, String role) {
        this.name = name;
        this.role = role;
    }
}
`
    },
    {
        id: 'cpp',
        name: 'C++',
        version: '10.2.0',
        extension: 'cpp',
        defaultValue: `// C++ Online Compiler
#include <iostream>
#include <string>
#include <vector>

using namespace std;

class User {
public:
    string name;
    string role;
    
    User(string n, string r) : name(n), role(r) {}
};

int main() {
    cout << "Hello, World!" << endl;
    
    User user("Developer", "Admin");
    cout << "Running as " << user.name << endl;
    
    return 0;
}
`
    },
    {
        id: 'c',
        name: 'C',
        version: '10.2.0',
        extension: 'c',
        defaultValue: `// C Online Compiler
#include <stdio.h>

int main() {
    printf("Hello, World!\\n");
    
    // Example: Variables
    int id = 10;
    char section = 'A';
    
    printf("Running in Section %c with ID %d\\n", section, id);
    
    return 0;
}
`
    }
];
