@local @local_oksigeniaclasstools
Feature: Teachers open the class tools from their course
  In order to use the classroom board with my students
  As a teacher
  I need a link to the class tools in my course, and students must not see it

  Background:
    Given the following "courses" exist:
      | fullname | shortname |
      | Course 1 | C1        |
    And the following "users" exist:
      | username | firstname | lastname |
      | teacher1 | Teacher   | One      |
      | student1 | Student   | One      |
    And the following "course enrolments" exist:
      | user     | course | role           |
      | teacher1 | C1     | editingteacher |
      | student1 | C1     | student        |

  Scenario: The teacher finds the class tools in the course bar
    When I am on the "C1" "Course" page logged in as "teacher1"
    Then I should see "Class tools" in the ".secondary-navigation" "css_element"

  Scenario: Students do not see the class tools
    When I am on the "C1" "Course" page logged in as "student1"
    Then I should not see "Class tools"

  Scenario: The class tools open from the course
    Given I am on the "C1" "Course" page logged in as "teacher1"
    When I click on "Class tools" "link" in the ".secondary-navigation" "css_element"
    Then I should see "Timer"

  @javascript
  Scenario: The teacher finds one of their classes on «Which class?»
    Given the following "courses" exist:
      | fullname | shortname |
      | Maths 5  | C2        |
    And the following "course enrolments" exist:
      | user     | course | role           |
      | teacher1 | C2     | editingteacher |
    When I log in as "teacher1"
    And I visit "/local/oksigeniaclasstools/index.php"
    Then I should see "Course 1" in the ".ct-ch-rejilla" "css_element"
    And I should see "Maths 5" in the ".ct-ch-rejilla" "css_element"
    # Hiding a course from here goes through the page's AMD module and the plugin's web service.
    And I click on ".ct-ch-ocultar" "css_element" in the ".ct-ch-sitio[data-name='Course 1']" "css_element"
    And I should not see "Course 1" in the ".ct-ch-rejilla" "css_element"
    And I should see "Maths 5" in the ".ct-ch-rejilla" "css_element"
    And I reload the page
    And I should not see "Course 1" in the ".ct-ch-rejilla" "css_element"
